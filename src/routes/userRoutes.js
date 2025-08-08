import express from "express";
import UserController from "../controllers/userController.js";
import UserRepository from "../repositories/userRepository.js";
import UserService from "../services/userService.js";

const userRouter = express.Router();

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

userRouter.post("/", userController.createUser);

export default userRouter;