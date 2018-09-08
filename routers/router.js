const Router = require("koa-router")
const article = require("../control/article")
const user = require("../control/user")
const comment = require("../control/comment")
const admin = require("../control/admin")
const upload = require("../util/upload")

const router = new Router

//设计主页
router.get("/" , user.keepLog, article.getList)

//主要用来处理 用户登录 用户注册
router.get(/^\/user\/(?=reg|login)/, async ctx => {
    // show 为true 则显示注册 ，为false 显示登录
    const show = /reg$/.test(ctx.path)
    
    await ctx.render("register" ,{show})
})

//注册用户 路由
router.post("/user/reg", user.reg)

//处理用户登录的post
router.post("/user/login", user.login)

//用户退出
router.get("/user/logout", user.logout)

//文章的发表页面
router.get("/article", user.keepLog , article.addPage)

//文章添加
router.post("/article", user.keepLog , article.add)

//文章列表分页路由
router.get("/page/:id", article.getList)

//文章详情页
router.get("/article/:id", user.keepLog, article.details)

//添加评论
router.post("/comment", user.keepLog, comment.save);

//后台
router.get("/admin/:id", user.keepLog, admin.index)

//头像上传功能
router.post("/upload", user.keepLog, upload.single('file'), user.upload)

//获取用户的所有评论
router.get("/user/comments", user.keepLog, comment.comlist)

//删除用户评论
router.del("/comment/:id", user.keepLog, comment.del)

//获取用户的所有文章
router.get("/user/articles", user.keepLog, article.artList)

//删除用户文章
router.del("/article/:id", user.keepLog, article.del)

// 404
router.get("*", async ctx => {
    await ctx.render("404", {
        title : "404"
    })
})

module.exports = router