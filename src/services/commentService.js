class CommentService {
    constructor(commentRepository, taskRepository, io) {
        this.commentRepository = commentRepository;
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

        return newComment;
    }

    async getTaskComment (taskId) {
        return await this.commentRepository.getCommentsByTaskId(taskId);
    }
}

export default CommentService;