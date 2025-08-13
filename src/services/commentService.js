class CommentService {
    constructor(commentRepository, io) {
        this.commentRepository = commentRepository;
        this.io = io;
    }

    async addComment(taskId, userId, comment) {
        const newComment = await this.commentRepository.createComment({ taskId, userId, comment });

        this.io.emit("commentAdded", newComment);

        return newComment;
    }

    async getTaskComment (taskId) {
        return await this.commentRepository.getCommentsByTaskId(taskId);
    }
}

export default CommentService;