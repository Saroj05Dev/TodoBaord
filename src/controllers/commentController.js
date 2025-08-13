class CommentController {
    constructor (commentService) {
        this.commentService = commentService;

        this.addComments = this.addComments.bind(this);
        this.getComments = this.getComments.bind(this);
    }

    async addComments (req, res) {
        try {
            const { taskId } = req.params;
            const { comment } = req.body;
            const userId = req.user.id

            const comments = await this.commentService.addComment(taskId, userId, comment);

            res.status(200).json({
                success: true,
                message: "Comment added successfully",
                data: comments,
                error: {}
            })
        } catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
                data: {},
                error: error
            })
        }
    }

    async getComments(req, res) {
        try {
            const { taskId } = req.params.id;
            const comments = await this.commentService.getComments(taskId);
            res.status(200).json({
                success: true,
                message: "Comments found successfully",
                data: comments,
                error: {}
            })
        } catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
                data: {},
                error: error
            })
        }
    }
}

export default CommentController;