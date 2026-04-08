import express from "express";
import UserController from "../controllers/userController.js";
import UserRepository from "../repositories/userRepository.js";
import UserService from "../services/userService.js";
import { isLoggedIn } from "../validations/authValidator.js";
import { loginLimiter, signupLimiter } from "../config/rateLimiter.js";

const userRouter = express.Router();

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

userRouter.post("/", signupLimiter, userController.createUser);
userRouter.post("/login", loginLimiter, userController.login);
userRouter.post("/logout", userController.logout);
userRouter.get("/count", isLoggedIn, userController.countAllUsers);
userRouter.get("/me", isLoggedIn, userController.getCurrentUser);
userRouter.get("/", isLoggedIn, userController.getAllUsers);

export default userRouter;