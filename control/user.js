const { db } = require("../Schema/config")
const UserSchema  = require("../Schema/user")
const encrypt = require("../util/encrypt")

//通过db对象创建操作user数据库的模型对象
const User = db.model("users", UserSchema)

//用户注册
exports.reg = async (ctx) => {
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
                password : encrypt(password)
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