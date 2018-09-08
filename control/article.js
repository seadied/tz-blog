const Article = require("../Models/article")
const User = require("../Models/user")
const Comment = require("../Models/comment")

//返回文章发表页
exports.addPage = async ctx => {
    await ctx.render("add-article", {
        title : "文章发表页",
        session : ctx.session
    })
}

//文章的发表（保存到数据库）
exports.add = async ctx => {
    if(ctx.session.isNew){
        //true 就没登录  就不需要查询数据库
        return ctx.body = {
            msg : "用户未登录",
            status : 0
        }
    }


    //用户登录的情况
    //用户登录情况下， post发过来的数据
    const data = ctx.request.body
    data.author = ctx.session.uid
    data.commentNum = 0

    await new Promise((resolve, reject) => {
        new Article(data).save((err, data) => {
            if(err)return reject(err)
            //更新用户文章计数
            User.update({_id: data.author}, {$inc: {articleNum: 1}}, err => {
                if(err)return console.log(err)
            })
            resolve(data)
        })
    })
    .then(data => {
        ctx.body = {
            msg : "发表成功",
            status : 1
        }
    })
    .catch(err => {
        ctx.body = {
            msg : "发表失败",
            status : 0
        }
        })
}

//获取文章列表
exports.getList = async ctx => {
    let page = ctx.params.id || 1
        page --
    

    const maxNum = await  Article.estimatedDocumentCount((err, num) => err? console.log(err):num)

    const artList = await Article
    .find()
    .sort('-created')
    .skip(5 * page)
    .limit(5)
    .populate({ //mongoose 用于联表查询
        path : "author",
        select : "_id username avatar"
    })
    .then(data => data)
    .catch(err => console.log(err))

    await ctx.render("index",{
        title: "博客实战首页",
        session: ctx.session,
        artList,
        maxNum
    })
}

//文章详情
exports.details = async ctx => {
    const _id = ctx.params.id

    //查找文章本身数据
    const article = await Article
    .findById(_id)
    .populate("author", "username")
    .then(data => data)

    //查找跟文章关联的所有评论
    const comment = await Comment
    .find({article: _id})
    .sort("-created")
    .populate("from","username avatar")
    .then(data => data)
    .catch(err => {
        console.log(err);
    })
    await ctx.render("article", {
        title : article.title,
        article,
        comment,
        session :ctx.session
    })


}

//返回用户的所有文章
exports.artList = async ctx => {
    const uid = ctx.session.uid
    
    const data = await Article.find({author: uid})
    
    ctx.body = {
        code: 0,
        count: data.length,
        data
    }
}

//删除对应id的文章
exports.del = async ctx => {
    const _id = ctx.params.id

    let res = {
        state: 1,
        message: "删除成功"
    }

    await Article.findById(_id)
    .then(data => data.remove())
    .catch(err => {
        res = {
            state: 0,
            message: "删除失败"
        }
    })

    ctx.body = res
}