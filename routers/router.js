const Router = require("koa-router")

const user = require("../control/user")
const router = new Router

//设计主页
router.get("/" , async ctx => {
    await ctx.render("index" , {
        title : "假装这是一个正经的title"
    })
})

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

module.exports = router