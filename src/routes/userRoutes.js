import express from "express";
import UserController from "../controllers/userController.js";
import UserRepository from "../repositories/userRepository.js";
import UserService from "../services/userService.js";
import { isLoggedIn } from "../validations/authValidator.js";

const userRouter = express.Router();

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

userRouter.post("/", userController.createUser);
userRouter.post("/login", userController.login);
userRouter.post("/logout", userController.logout);
userRouter.get("/count", isLoggedIn, userController.countAllUsers);

export default userRouter;