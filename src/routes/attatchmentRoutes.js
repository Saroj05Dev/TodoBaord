import express from "express";
import upload from "../middlewares/multerMiddleware.js";
import AttatchmentRepository from "../repositories/attatchmentRepository.js";
import AttatchmentService from "../services/attatchmentService.js";
import AttatchmentController from "../controllers/attatchmentController.js";
import { isLoggedIn } from "../validations/authValidator.js";
import ActionService from "../services/actionLogService.js";
import ActionRepository from "../repositories/actionRepository.js";

const createAttachmentRouter = (io) => {
    const attatchmentRouter = express.Router();

    const attatchmentRepository = new AttatchmentRepository();
    const actionRepository = new ActionRepository()
    const actionService = new ActionService(actionRepository, io);
    const attatchmentService = new AttatchmentService(attatchmentRepository, actionService, io);
    const attatchmentController = new AttatchmentController(attatchmentService)

    attatchmentRouter.post(
        "/:taskId",
        isLoggedIn,
        upload.single("file"),
        attatchmentController.addAttachment
    )

    attatchmentRouter.delete(
        "/:taskId/:publicId",
        isLoggedIn,
        attatchmentController.deleteAttatchment
    )

    return attatchmentRouter;
}

export default createAttachmentRouter;