const Koa = require("koa")
const views = require("koa-views")
const static = require("koa-static")
const logger = require("koa-logger")
const { join } = require("path")
const session = require("koa-session")
const body = require("koa-body")
const router = require("./routers/router")

//生成Koa实例
const app = new Koa

app.keys = ["海逝SAMA"]

//session的配置对象
const CONFIG = {
    key : "Sid",
    maxAge : 36e5,
    overwrite : true,
    httpOnly : true,
    signed : true,
    rolling : true
}

//注册日志模块
// app.use(logger())

//注册sesssion
app.use(session(CONFIG, app))

//配置koa-body 处理post 请求数据
app.use(body())

//配置静态资源目录
app.use(static(join(__dirname , "public")))

//配置视图模板
app.use(views(join(__dirname , "views"), {
    extension: "pug"
}))

//注册路由信息
app.use(router.routes()).use(router.allowedMethods())

app.listen(3000, () => {
    console.log("项目启动成功，监听在3000端口")
})