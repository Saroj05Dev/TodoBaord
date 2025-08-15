import Comments from "../schemas/commentSchema.js";

class CommentRepository {
    async createComment (comment) {
        try {
            const comments = await Comments.create(comment)
            return comments
        } catch (error) {
            console.log(error)
            throw new Error("Error creating comment", error)
        }
    }

    async deleteComment (commentId) {
        try {
            const comment = await Comments.findByIdAndDelete(commentId)
            if(!comment) {
                throw new Error("Comment not found")
            }
            return comment
        } catch (error) {
            console.log(error)
            throw new Error("Error creating comment", error)
        }
    }

    async getCommentsByTaskId(taskId) {
        try {
            const comments = await Comments.find({ taskId })
            .populate("userId", "fullName email")
            .sort({ createdAt: 1 }) // oldest first
            return comments
        } catch (error) {
            console.log(error)
            throw new Error("Error getting comments", error)
        }
    }

    async findCommentById(commentId) {
        try {
            return await Comments.findById(commentId);
        } catch (error) {
            console.log(error);
            throw new Error("Error finding comment", error);
        }
    }
}

export default CommentRepository;