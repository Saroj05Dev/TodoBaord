import express from "express";
import upload from "../middlewares/multerMiddleware.js";
import { isLoggedIn } from "../validations/authValidator.js";
import ActionService from "../services/actionLogService.js";
import ActionRepository from "../repositories/actionRepository.js";
import AttachmentRepository from "../repositories/attatchmentRepository.js";
import AttachmentService from "../services/attatchmentService.js";
import AttachmentController from "../controllers/attatchmentController.js";

const createAttachmentRouter = (io) => {
  const attachmentRouter = express.Router();

  const attachmentRepository = new AttachmentRepository();
  const actionRepository = new ActionRepository();
  const actionService = new ActionService(actionRepository, io);
  const attachmentService = new AttachmentService(
    attachmentRepository,
    actionService,
    io
  );
  const attachmentController = new AttachmentController(attachmentService);

  attachmentRouter.post(
    "/:taskId",
    isLoggedIn,
    upload.single("file"),
    attachmentController.addAttachment
  );

  attachmentRouter.get("/:taskId", isLoggedIn, attachmentController.fetchAllAttachments);

  attachmentRouter.delete("/:taskId", isLoggedIn, (req, res) =>
    attachmentController.deleteAttachment(req, res)
  );

  return attachmentRouter;
};

export default createAttachmentRouter;
