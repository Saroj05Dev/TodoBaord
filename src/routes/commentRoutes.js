import express from "express";
import CommentController from "../controllers/commentController.js";
import { isLoggedIn } from "../validations/authValidator.js";
import CommentRepository from "../repositories/commentRepository.js";
import CommentService from "../services/commentService.js";
import TaskRepository from "../repositories/taskRepository.js";
import ActionRepository from "../repositories/actionRepository.js";
import ActionService from "../services/actionLogService.js";

const createcommentRouter = (io) => {
    const commentRouter = express.Router();

    const commentRepository = new CommentRepository();
    const taskRepository = new TaskRepository();
    const actionRepository = new ActionRepository();
    const actionService = new ActionService(actionRepository, io);
    const commentService = new CommentService(commentRepository, taskRepository, actionService, io);
    const commentController = new CommentController(commentService);

    // Add a comment
    commentRouter.post("/:taskId", isLoggedIn, commentController.addComments)

    // Get all comments for a task
    commentRouter.get("/:taskId", isLoggedIn, commentController.getComments);

    // delete a comment
    commentRouter.delete("/:commentId", isLoggedIn, commentController.deleteComments);

    return commentRouter;
}

export default createcommentRouter;