import express from "express";
import CommentController from "../controllers/commentController.js";
import { isLoggedIn } from "../validations/authValidator.js";
import CommentRepository from "../repositories/commentRepository.js";
import CommentService from "../services/commentService.js";
import TaskRepository from "../repositories/taskRepository.js";
import ActionRepository from "../repositories/actionRepository.js";
import ActionService from "../services/actionLogService.js";

const createCommentRouter = (io) => {
    const commentRouter = express.Router();

    const commentRepository = new CommentRepository();
    const taskRepository = new TaskRepository();
    const actionRepository = new ActionRepository();
    const actionService = new ActionService(actionRepository, io);
    const commentService = new CommentService(commentRepository, taskRepository, actionService, io);
    const commentController = new CommentController(commentService);

    // Add a comment to a task
    commentRouter.post("/:taskId", isLoggedIn, commentController.addComments);

    // Get all comments for a specific task
    commentRouter.get("/task/:taskId", isLoggedIn, commentController.getComments);

    // Delete a comment
    commentRouter.delete("/:commentId", isLoggedIn, commentController.deleteComments);

    return commentRouter;
}

export default createCommentRouter;