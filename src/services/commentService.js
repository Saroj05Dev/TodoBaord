class CommentService {
    constructor(commentRepository, taskRepository, actionService, io) {
        this.commentRepository = commentRepository;
        this.actionService = actionService;
        this.taskRepository = taskRepository;
        this.io = io;
    }

    async addComment(taskId, userId, comment) {
        // check if task exists
        const task = await this.taskRepository.findTaskById(taskId);
        if(!task) {
            const error = new Error("Task not found!");
            error.statusCode = 404;
            throw error;
        }

        const assignedUserId = task.assignedUser?._id 
        ? task.assignedUser._id.toString() 
        : task.assignedUser?.toString();

        if (
            task.createdBy.toString() !== userId.toString() &&
            (!assignedUserId || assignedUserId !== userId.toString())
        ) {
            const error = new Error("You are not authorized to add a comment to this task.");
            error.statusCode = 403;
            throw error;
        }


        // create comment
        const newComment = await this.commentRepository.createComment({ taskId, userId, comment });

        // Broadcast real-time
        this.io.emit("commentAdded", newComment);

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

    // Get the task from the comment itself
    const task = await this.taskRepository.findTaskById(comment.taskId);
    if (!task) {
        const error = new Error("Task not found!");
        error.statusCode = 404;
        throw error;
    }

    // Permission check — creator or assigned user
    const assignedUserId = task.assignedUser?._id
        ? task.assignedUser._id.toString()
        : task.assignedUser?.toString();

    if (
        task.createdBy.toString() !== userId.toString() &&
        (!assignedUserId || assignedUserId !== userId.toString())
    ) {
        const error = new Error("You are not authorized to delete this comment.");
        error.statusCode = 403;
        throw error;
    }

    // Delete the comment
    const deletedComment = await this.commentRepository.deleteComment(commentId);

    // Emit real-time event
    this.io.emit("commentDeleted", deletedComment);

    // Log action
    await this.actionService.logAndEmit(userId, task._id, "comment_deleted");

    return deletedComment;
}


    async getTaskComment (taskId) {
        return await this.commentRepository.getCommentsByTaskId(taskId);
    }
}

export default CommentService;