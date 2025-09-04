class CommentService {
    constructor(commentRepository, taskRepository, actionService, io) {
        this.commentRepository = commentRepository;
        this.actionService = actionService;
        this.taskRepository = taskRepository;
        this.io = io;
    }

    async addComment(taskId, userId, commentText) {
        // Check if the task exists
        const task = await this.taskRepository.findTaskById(taskId);
        if (!task) {
            const error = new Error("Task not found!");
            error.statusCode = 404;
            throw error;
        }
        
        // Create the comment in the database
        const newComment = await this.commentRepository.createComment({ taskId, userId, comment: commentText });

        // Broadcast real-time update
        this.io.emit("commentAdded", newComment);

        // Log the action
        await this.actionService.logAndEmit(userId, newComment._id, "comment_added");

        return newComment;
    }

    async removeComment(commentId, userId) {
        // Find the comment first
        const comment = await this.commentRepository.findCommentById(commentId);
        if (!comment) {
            const error = new Error("Comment not found!");
            error.statusCode = 404;
            throw error;
        }

        // Check if the user is the owner of the comment
        if (comment.userId.toString() !== userId.toString()) {
            const error = new Error("You are not authorized to delete this comment.");
            error.statusCode = 403;
            throw error;
        }

        const deletedComment = await this.commentRepository.deleteComment(commentId);

        // Emit real-time event
        this.io.emit("commentDeleted", deletedComment);

        // Log action
        await this.actionService.logAndEmit(userId, deletedComment.taskId, "comment_deleted");

        return deletedComment;
    }

    async getTaskComment(taskId) {
        return await this.commentRepository.getCommentsByTaskId(taskId);
    }
}

export default CommentService;