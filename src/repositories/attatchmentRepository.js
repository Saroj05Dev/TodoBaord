import Task from "../schemas/taskSchema.js";

class AttachmentRepository {
    async addAttachmentsToTasks(taskId, attachmentsData) {
        try {
            const res = await Task.findByIdAndUpdate(
                taskId,
                { $push: { attachments: attachmentsData } },
                { new: true }
            )
            return res
        } catch (error) {
            console.log(error);
            throw new Error("Error attaching file", error)
        }
    }

    async removeAttachmentsFromTask(taskId, publicId) {
        try {
            const res = await Task.findByIdAndUpdate(
                taskId,
                { $pull: { attachments: { publicId } } },
                { new: true }
            )
            return res
        } catch (error) {
            console.log(error);
            throw new Error("Error removing attachments", error)
        }
    }

    async fetchAllAttachments(taskId) {
        try {
            const task = await Task.findById(taskId).populate("attachments");
            return task.attachments;
        } catch (error) {
            console.log(error);
            throw new Error("Error fetching all attachments", error)
        }
    }

    async getTaskById(taskId) {
        return await Task.findById(taskId);
    }
}

export default AttachmentRepository;