import Task from "../schemas/taskSchema.js";

class TaskRepository {
    async createTask (task) {
        try {
            const newTask = await Task.create(task);
            return newTask;
        } catch (error) {
            console.log(error);
            if(error.statusCode === 11000) {
                throw {reason: "Task with this title already exists", statusCode: 400};
            }
            throw new Error("Error creating task", error);
        }
    }

    async findTask () {
        try {
            const task = await Task.find().populate("assignedUser", "fullName email");
            return task;
        } catch (error) {
            throw new Error("Error finding task", error);
        }
    }

    async findTaskById (taskId) {
        try {
            const task = await Task.findById(taskId).populate("assignedUser", "fullName email");
            return task;
        } catch (error) {
            throw new Error("Error finding task", error);
        }
    }

    async updateTask (taskId, task) {
        try {
            const updatedTask = await Task.findByIdAndUpdate(taskId, task, { 
                new: true, 
                runValidators: true 
            });
            return updatedTask;
        } catch (error) {
            throw new Error("Error updating task", error);
        }
    }

    async deleteTask (taskId) {
        try {
            const deletedTask = await Task.findByIdAndDelete(taskId);
            return deletedTask;
        } catch (error) {
            throw new Error("Error deleting task", error);
        }
    }
}

export default TaskRepository;