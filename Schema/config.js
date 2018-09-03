// 连接数据库 导出db Schema
const mongoose = require("mongoose")
const db = mongoose.createConnection
("mongodb://localhost:27017/blogproject", {useNewUrlParser: true})

mongoose.Promise = global.Promise

//把mongoose的Schema取出来
const Schema = mongoose.Schema

db.on("error", () => {
    console.log("连接数据库成功")
})
db.on("open", () => {
    console.log("blogproject数据库连接成功")
})

module.exports = {
    db,
    Schema
}