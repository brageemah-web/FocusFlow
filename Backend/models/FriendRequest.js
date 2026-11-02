const mongoose = require("mongoose");

const friendRequestSchema = new mongoose.Schema({
    sender:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required: true 
    },
    receiver : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    status : {
        type : String,
        enum : ["pending","accept", "reject"],
        default : "pending"
    }
},
{
    timestamps : true
}
);

//prevent duplicate requests between the same two users
friendRequestSchema.index(
    {sender : 1, receiver: 1},
    {unique : true}
);

const   FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);
module.exports = FriendRequest;