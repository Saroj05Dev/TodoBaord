import express from "express";
import { isLoggedIn } from "../validations/authValidator.js";
import TaskRepository from "../repositories/taskRepository.js";
import TaskController from "../controllers/taskController.js";
import TaskService from "../services/taskService.js";
import ActionRepository from "../repositories/actionRepository.js";
import ActionService from "../services/actionLogService.js";
import UserRepository from "../repositories/userRepository.js";

const createTaskRouter = (io) => {
  const taskRouter = express.Router();

  const taskRepository = new TaskRepository();
  const actionRepository = new ActionRepository();
  const userRepository = new UserRepository();
  const actionService = new ActionService(actionRepository, io);
  const taskService = new TaskService(taskRepository, actionService, userRepository, io);
  const taskController = new TaskController(taskService, io);

  taskRouter.post("/", isLoggedIn, taskController.createTask);
  taskRouter.get("/", isLoggedIn, taskController.findTask);
  taskRouter.get("/:id", isLoggedIn, taskController.findTaskById);
  taskRouter.put("/:id", isLoggedIn, taskController.updateTask);
  taskRouter.delete(
    "/:id",
    isLoggedIn,
    taskController.deleteTask
  );
  taskRouter.put("/:id/smart-assign", isLoggedIn, taskController.smartAssign);
  taskRouter.post(
    "/:id/resolve-conflict",
    isLoggedIn,
    taskController.resolveConflict
  );

  return taskRouter;
};

export default createTaskRouter;
