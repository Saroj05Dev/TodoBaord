class CommentController {
  constructor(commentService) {
    this.commentService = commentService;

    // Bind 'this' to the class methods to ensure correct context
    this.addComments = this.addComments.bind(this);
    this.getComments = this.getComments.bind(this);
    this.deleteComments = this.deleteComments.bind(this);
  }

  async addComments(req, res) {
    try {
      const { taskId } = req.params;
      const { comment } = req.body;
      const userId = req.user.id;

      const newComment = await this.commentService.addComment(
        taskId,
        userId,
        comment
      );

      res.status(201).json({
        success: true,
        message: "Comment added successfully",
        data: newComment,
        error: {},
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
        data: {},
        error: error.message,
      });
    }
  }

  async deleteComments(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.user.id;

      const deletedComment = await this.commentService.removeComment(commentId, userId);

      res.status(200).json({
        success: true,
        message: "Comment deleted successfully",
        data: deletedComment,
        error: {}
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
        data: {},
        error: error.message
      });
    }
  }

  async getComments(req, res) {
    try {
      const { taskId } = req.params;
      const userId = req.user.id; // Passing userId to the service for authorization
      const comments = await this.commentService.getTaskComment(taskId, userId);
      res.status(200).json({
        success: true,
        message: "Comments found successfully",
        data: comments,
        error: {},
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
        data: {},
        error: error.message,
      });
    }
  }
}

export default CommentController;