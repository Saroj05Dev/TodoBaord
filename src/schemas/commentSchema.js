import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    comment: {
        type: String,
        required: true,
        trim: true
    },
}, { timestamps: true });

const Comments = mongoose.model("Comment", commentSchema);

export default Comments;