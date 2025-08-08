import express from "express";
import ActionRepository from "../repositories/actionRepository.js";
import ActionService from "../services/actionLogService.js";
import ActionController from "../controllers/actionController.js";
import { isLoggedIn } from "../validations/authValidator.js";

const createActionRouter = (io) => {

    const actionRouter = express.Router();

    const actionRepository = new ActionRepository();
    const actionService = new ActionService(actionRepository, io);
    const actionController = new ActionController(actionService, io);

    actionRouter.get("/", isLoggedIn, actionController.getRecentActions);

    return actionRouter;
}

export default createActionRouter;