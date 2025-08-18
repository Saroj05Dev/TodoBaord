import SubTasks from "../schemas/subtasksSchema.js";

class SubTaskRepository {
    async createSubTask (subTask) {
        try {
            const newSubTask = await SubTasks.create(subTask);
            return newSubTask;
        } catch (error) {
            console.log(error);
            if(error.statusCode === 11000) {
                throw {reason: "Subtask with this title already exists", statusCode: 400}
            }
            throw new Error("Error creating subtask", error);
        }
    }

    // async findSubTaskById (subtaskId) {
    //     try {
    //         return await SubTasks.findById(subtaskId);
    //     } catch (error) {
    //         console.log(error);
    //         throw new Error("Error finding subtask", error);
    //     }
    // }

    async deleteSubTask (subtaskId) {
        try {
            const subtask = await SubTasks.findByIdAndDelete(subtaskId)
            if(!subtask) {
                throw new Error("Subtask not found")
            }
            return subtask
        } catch (error) {
            console.log(error);
            throw new Error("Error deleting subtask", error);
        }
    }

    async getSubTasksByTaskId (taskId) {
        try {
            const subtasks = await SubTasks.find({ parentTask: taskId })
            .populate([
            { path: "assignedUser", select: "fullName email" },
            { path: "createdBy", select: "fullName email" }
        ]);
            return subtasks;
        } catch (error) {
            console.log(error);
            throw new Error("Error getting subtasks", error);
        }
    }

    async updateSubTask (subtaskId, subtask) {
        try {
            const updatedSubTask = await SubTasks.findByIdAndUpdate(subtaskId, subtask, { new: true });
            return updatedSubTask;
        } catch (error) {
            console.log(error);
            throw new Error("Error updating subtask", error);
        }
    }
}

export default SubTaskRepository;