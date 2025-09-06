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

    // Authorization check: Only creator or assigned user can add comments
    const createdById = task.createdBy?._id?.toString();
    const assignedUserId = task.assignedUser?._id?.toString();
    
    if (createdById !== String(userId) && assignedUserId !== String(userId)) {
      const error = new Error("You are not authorized to add a comment to this task.");
      error.statusCode = 403;
      throw error;
    }

    // Create the comment in the database
    const newComment = await this.commentRepository.createComment({ taskId, userId, comment: commentText });

    // Broadcast real-time update
    this.io.emit("commentAdded", newComment);

    // Log the action
    await this.actionService.logAndEmit(userId, newComment._id, "comment_added", { commentText });

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

    // Get the task to check for creator/assignee permissions
    const task = await this.taskRepository.findTaskById(comment.taskId);
    if (!task) {
        const error = new Error("Task not found!");
        error.statusCode = 404;
        throw error;
    }

    // Authorization check: User can delete if they are the comment's owner, the task creator, or the assigned user
    const isCommentOwner = comment.userId.toString() === userId.toString();
    const isTaskCreator = task.createdBy?._id?.toString() === String(userId);
    const isTaskAssignee = task.assignedUser?._id?.toString() === String(userId);
    
    if (!isCommentOwner && !isTaskCreator && !isTaskAssignee) {
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

  async getTaskComment(taskId, userId) {
    const currentTask = await this.taskRepository.findTaskById(taskId);
    if (!currentTask) {
      const error = new Error("Task not found!");
      error.statusCode = 404;
      throw error;
    }
    
    // Authorization check: Only the creator & assignee can view the comments
    const createdById = currentTask.createdBy?._id?.toString();
    const assignedUserId = currentTask.assignedUser?._id?.toString();
    
    if (createdById !== String(userId) && assignedUserId !== String(userId)) {
      const error = new Error("You are not authorized to view this task.");
      error.statusCode = 403;
      throw error;
    }

    return await this.commentRepository.getCommentsByTaskId(taskId);
  }
}

export default CommentService;