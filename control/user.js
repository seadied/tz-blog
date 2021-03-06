const User = require("../Models/user")
const encrypt = require("../util/encrypt")

//用户注册
exports.reg = async ctx => {
    // 用户注册时 post 发过来的数据
    const user = ctx.request.body
    const username = user.username
    const password = user.password
    //去数据库 user 先查询当前发过来的 username 是否存在 
    await new Promise((resolve , reject) => {
        //去users数据库查询
        User.find({username}, (err, data) => {
            if(err)return reject(err)
            //数据库查询没出错？ 还有可能没有数据
            if(data.length !== 0){
                //查询到数据 ---> 用户名已经存在
                return resolve("")
            }
            //用户名不存在 需要存到数据库
            //保存到数据库之前需要先加密 , encrypt模块是自定义的加密模块
            const _user = new User({
                username,
                password : encrypt(password),
                articleNum : 0,
                commentNum : 0
            })

            _user.save((err, data) => {
                if(err){
                    reject(err)
                }else{
                    resolve(data)
                }
            })
        })
    })
    .then(async data => {
        if(data){
            //注册成功
            await ctx.render("isOk", {
                status: "注册成功"
            })
        }else{
            //用户名已存在
            await ctx.render("isOk", {
                status: "用户名已存在"
            })
        }
    })
    .catch(async err => {
        await ctx.render("isOk", {
            status: "注册失败，请重试"
        })
    })
}

//用户登录
exports.login = async ctx => {
    const user = ctx.request.body
    const username = user.username
    const password = user.password
    await new Promise((resolve , reject) => {
        User.find({username}, (err, data) => {
            if(err)return reject(err)
            if(data.length === 0)return reject('用户名不存在')
            if(data[0].password === encrypt(password)){
                return resolve(data)
            }
            resolve("")
        })
    })
    .then(async data => {
        if(!data){
            return ctx.render('isOk', {
                status : '密码不正确，登录失败'
            })
        }

        //让用户在他的 cookie 里设置 username password 加密后的密码 权限
        ctx.cookies.set("username", username , {
            domian : "localhost",
            path : "/",
            maxAge : 36e5,
            overwrite : false,
            httpOnly : true //true 不让客户端能访问这个 cookie
        })

        ctx.cookies.set("uid", data[0]._id , {
            domian : "localhost",
            path : "/",
            maxAge : 36e5,
            overwrite : false,
            httpOnly : true
        })
        
        ctx.session = {
            username,
            uid : data[0]._id,
            avatar : data[0].avatar,
            role : data[0].role
        }

        await ctx.render('isOk', {
            status : '登录成功'
        })
    })

    .catch(async err => {
        await ctx.render('isOk', {
            status : '登录失败'
        })
    })
}

//保持用户的状态
exports.keepLog = async (ctx , next) => {
    if(ctx.session.isNew){
        if(ctx.cookies.get('username')){
            let uid = ctx.cookies.get("uid")
            const avatar = await User.findById(uid)
                .then(data => data.avatar)


            ctx.session = {
                username : ctx.cookies.get("username"),
                uid,
                avatar
            }
        }
    }
    await next()
}

//用户退出中间件
exports.logout = async ctx => {
    ctx.session = null
    ctx.cookies.set("username", null, {
        maxAge : 0
    })
    ctx.cookies.set("uid", null, {
        maxAge : 0
    })
    //后台重定向到 根
    ctx.redirect("/")
}

//用户的头像上传
exports.upload = async ctx => {
    const filename = ctx.req.file.filename
    
    let data = {}

    await User.update({_id: ctx.session.uid}, {$set: {avatar: "/avatar/" + filename}}, (err, res) => {
        if(err){
            data = {
                status: 0,
                message: "上传失败"
            }
        }else{
            data = {
                status: 1,
                message: "上传成功"
            }
        }
    })
    ctx.body = data
}