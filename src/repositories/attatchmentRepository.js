import Task from "../schemas/taskSchema.js";

class AttatchmentRepository {
    async addAttatchmentToTask(taskId, attatchmentData) {
        try {
            const res = await Task.findByIdAndUpdate(
                taskId,
                { $push: { attatchments: attatchmentData } },
                { new: true }
            )
        } catch (error) {
            console.log(error);
            throw new Error("Error attatching file", error)
        }
    }

    async removeAttatchmentFromTask(taskId, publicId) {
        try {
            const res = await Task.findByIdAndUpdate(
                taskId,
                { $pull: { attatchments: { publicId } } },
                { new: true }
            )
        } catch (error) {
            console.log(error);
            throw new Error("Error removing attatchment", error)
        }
    }

    async getTaskById(taskId) {
        return await Task.findById(taskId);
    }
}

export default AttatchmentRepository;