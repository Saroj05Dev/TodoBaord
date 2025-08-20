import express from "express";
import SubTaskRepository from "../repositories/subtasksRepository.js";
import SubTaskService from "../services/subtasksService.js";
import ActionRepository from "../repositories/actionRepository.js";
import ActionService from "../services/actionLogService.js";
import SubTaskController from "../controllers/subtasksController.js";
import { isLoggedIn } from "../validations/authValidator.js"
import TaskRepository from "../repositories/taskRepository.js";

const createSubTaskRouter = (io) => {

    const subtaskRouter = express.Router();

    const subtaskRepository = new SubTaskRepository();
    const taskRepository = new TaskRepository();
    const actionRepository = new ActionRepository()
    const actionService = new ActionService(actionRepository, io)
    const subtaskService = new SubTaskService(subtaskRepository, taskRepository, actionService, io);
    const subtaskController = new SubTaskController(subtaskService);

    // Routes 
    subtaskRouter.post("/:taskId/subtasks", isLoggedIn, subtaskController.createSubTask);
    subtaskRouter.put("/:taskId/subtasks/:subtaskId", isLoggedIn, subtaskController.updateSubTask);
    subtaskRouter.delete("/:taskId/subtasks/:subtaskId", isLoggedIn, subtaskController.deleteSubTask);
    subtaskRouter.get("/:taskId/subtasks", isLoggedIn, subtaskController.listSubtasks);

    return subtaskRouter;
}

export default createSubTaskRouter;