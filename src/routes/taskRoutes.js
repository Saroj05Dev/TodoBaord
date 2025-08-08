import express from "express";
import { isLoggedIn } from "../validations/authValidator.js";
import TaskRepository from "../repositories/taskRepository.js";
import TaskController from "../controllers/taskController.js";
import TaskService from "../services/taskService.js";

const taskRouter = express.Router();

const taskRepository = new TaskRepository();
const taskService = new TaskService(taskRepository);
const taskController = new TaskController(taskService);

taskRouter.post("/", isLoggedIn, taskController.createTask);
taskRouter.get("/", isLoggedIn, taskController.findTask);
taskRouter.get("/:id", isLoggedIn, taskController.findTaskById);
taskRouter.put("/:id", isLoggedIn, taskController.updateTask);
taskRouter.delete("/:id", isLoggedIn, taskController.deleteTask);


export default taskRouter;