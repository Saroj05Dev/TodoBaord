import express from "express";
import { isLoggedIn } from "../validations/authValidator.js";
import TaskRepository from "../repositories/taskRepository.js";
import TaskController from "../controllers/taskController.js";
import TaskService from "../services/taskService.js";
import ActionRepository from "../repositories/actionRepository.js";
import ActionService from "../services/actionLogService.js";

const createTaskRouter = (io) => {
    
    const taskRouter = express.Router();
    
    const taskRepository = new TaskRepository();
    const actionRepository = new ActionRepository();
    const actionService = new ActionService(actionRepository, io);
    const taskService = new TaskService(taskRepository, actionService, io);
    const taskController = new TaskController(taskService, io);
    
    taskRouter.post("/", isLoggedIn, taskController.createTask);
    taskRouter.get("/", isLoggedIn, taskController.findTask);
    taskRouter.get("/:id", isLoggedIn, taskController.findTaskById);
    taskRouter.put("/:id", isLoggedIn, taskController.updateTask);
    taskRouter.delete("/:id", isLoggedIn, taskController.deleteTask);
    taskRouter.put("/:id/smart-assign", isLoggedIn, taskController.smartAssign);
    
    return taskRouter;
}

export default createTaskRouter;