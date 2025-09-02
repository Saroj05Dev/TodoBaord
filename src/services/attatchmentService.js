import fs from "fs";
import cloudinary from "../config/cloudinaryConfig.js"

class AttachmentService {
    constructor(attachmentRepository, actionService, io) {
        this.attachmentRepository = attachmentRepository;
        this.actionService = actionService;
        this.io = io;
    }

    async addAttachments(taskId, userId, file) {
        const task = await this.attachmentRepository.getTaskById(taskId);

        if(!task) {
            const err = new Error("Task not found!");
            err.statusCode = 404;
            throw err;
        }

        // Check permission: creator or assignedUser
        if(
            task.createdBy.toString() !== userId.toString() &&
            (!task.assignedUser || task.assignedUser.toString() !== userId.toString())
        ){
            const err = new Error("You are not authorized to add an attachments to this task.");
            err.statusCode = 403;
            throw err;
        }

        // upload to cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
            folder: "task_attachments",
            resource_type: "auto"
        });

        fs.unlinkSync(file.path) // deleting temp file

        const attachmentsData = {
            filename: file.originalname,
            fileUrl: result.secure_url,
            publicId: result.public_id,
            uploadedBy: userId
        };
        const updatedTask = await this.attachmentRepository.addAttachmentsToTasks(taskId, attachmentsData);

        this.io.emit("attachmentAdded", { taskId, attachment: attachmentsData });

        await this.actionService.logAndEmit(
            userId,
            taskId,
            "attachment_added"
        );

        return updatedTask;
    }

    async removeAttachments(taskId, userId, publicId) {
        const task = await this.attachmentRepository.getTaskById(taskId);
        if(!task) {
            const err = new Error("Task not found");
            err.statusCode = 404;
            throw err;
        }

        const attachment = task.attachments.find(att => att.publicId === publicId)
        if(!attachment) throw new Error("Attachment not found!");

        // Permissiong: only uploader or creator can delete 
        if(
            task.createdBy.toString() !== userId.toString() &&
            attachment.uploadedBy.toString() !== userId.toString()
        ) {
            const err = new Error("You are not authorized to delete thi attachment.")
            err.statusCode = 403
            throw err;
        }

        // Remove from cloudinary
        await cloudinary.uploader.destroy(publicId);

        const updatedTask = await this.attachmentRepository.removeAttachmentsFromTask(taskId, publicId);

        this.io.emit("attachmentDeleted", { taskId, publicId });

        await this.actionService.logAndEmit(
        userId,
        taskId,
        "attachment_deleted"
    );

        return updatedTask;
    }

    async fetchAllAttachments (taskId) {
        const attachments = await this.attachmentRepository.fetchAllAttachments(taskId);
        return attachments;
    }
}

export default AttachmentService;