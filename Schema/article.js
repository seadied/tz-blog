const { Schema } = require("./config")
const ObjectId = Schema.Types.ObjectId

const ArticleSchema = new Schema({
    title : String,
    content : String,
    author : {  //关联users用户表
        type : ObjectId,
        ref : "users"
    },
    tips : String
}, {versionKey : false, timestamps : {
    createdAt : "created"
}})

module.exports = ArticleSchema
