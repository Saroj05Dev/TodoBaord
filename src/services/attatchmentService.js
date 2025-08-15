import fs from "fs";
import cloudinary from "../config/cloudinaryConfig.js"

class AttatchmentService {
    constructor(attatchmentRepository, io) {
        this.attatchmentRepository = attatchmentRepository;
        this.io = io;
    }

    async addAttatchment(taskId, userId, file) {
        const task = await this.attatchmentRepository.getTaskById(taskId);

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
            const err = new Error("You are not authorized to add an attatchment to this task.");
            err.statusCode = 403;
            throw err;
        }

        // upload to cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
            folder: "task_attatchment",
            resource_type: "auto"
        });

        fs.unlinkSync(file.path) // deleting temp file

        const attatchmentData = {
            filename: file.originalname,
            fileUrl: result.secure_url,
            publicId: result.public_id,
            uploadedBy: userId
        };
        const updatedTask = await this.attatchmentRepository.addAttatchmentToTask(taskId, attatchmentData);

        this.io.emit("attatchmentAdded", { taskId, attatchment: attatchmentData });

        return updatedTask;
    }

    async removeAttatchment(taskId, userId, publicId) {
        const task = await this.attatchmentRepository.getTaskById(taskId);
        if(!task) {
            const err = new Error("Task not found");
            err.statusCode = 404;
            throw err;
        }

        const attatchment = task.attatchments.find(att => att.publicId === publicId)
        if(!attatchment) throw new Error("Attatchment not found!");

        // Permissiong: only uploader or creator can delete 
        if(
            task.createdBy.toString() !== userId.toString() &&
            attatchment.uploadedBy.toString() !== userId.toString()
        ) {
            const err = new Error("You are not authorized to delete thi attatchment.")
            err.statusCode = 403
            throw err;
        }

        // Remove from cloudinary
        await cloudinary.uploader.destroy(publicId);

        const updatedTask = await this.attatchmentRepository.removeAttatchmentFromTask(taskId, publicId);

        this.io.emit("attatchmentDeleted", { taskId, publicId });

        return updatedTask;
    }
}

export default AttatchmentService;