const { Schema } = require("./config")
const ObjectId = Schema.Types.ObjectId

const CommentSchema = new Schema({
    content : String,
    from : {
        type : ObjectId,
        ref : "users"
    },
    article : {
        type :ObjectId,
        ref : "articles"
    }

}, {versionKey : false, timestamps : {
    createdAt : "created"
}})

//设置comment 的 remove 钩子
CommentSchema.post("remove", (doc) => {
    const Article = require("../Models/article")
    const User = require("../Models/user")
   
    const { from, article } = doc

    //对应文章的评论数 -1
    Article.updateOne({_id: article}, {$inc: {commentNum: -1}}).exec()
    //当前被删除评论的作者的commentNum -1
    User.updateOne({_id: from}, {$inc: {commentNum: -1}}).exec()

})


module.exports = CommentSchema
