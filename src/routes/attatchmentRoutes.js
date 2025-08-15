import express from "express";
import upload from "../middlewares/multerMiddleware.js";
import AttatchmentRepository from "../repositories/attatchmentRepository.js";
import AttatchmentService from "../services/attatchmentService.js";
import AttatchmentController from "../controllers/attatchmentController.js";
import { isLoggedIn } from "../validations/authValidator.js";

const createAttachmentRouter = (io) => {
    const attatchmentRouter = express.Router();

    const attatchmentRepository = new AttatchmentRepository();
    const attatchmentService = new AttatchmentService(attatchmentRepository, io);
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