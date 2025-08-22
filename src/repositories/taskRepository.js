import Task from "../schemas/taskSchema.js";
import User from "../schemas/userSchema.js";

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

    async findTask (userId) {
        try {
            const task = await Task.find({
            $or: [
                { createdBy: userId },
                { assignedUser: userId }
            ]
        }).populate("createdBy assignedUser", "fullName email");
            return task;
        } catch (error) {
            throw new Error("Error finding task", error);
        }
    }

    async findTaskById (taskId, userId) {
        try {
            const task = await Task.findOne({
            _id: taskId,
            $or: [
                { createdBy: userId },
                { assignedUser: userId }
            ]
            }).populate("createdBy assignedUser", "fullName email");
            return task;
        } catch (error) {
            console.log(error)
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

    async getAllUsers () {
        try {
            const users = await User.find({}, "_id fullName email");
            return users;
        } catch (error) {
            console.log(error)
            throw new Error("Error getting all users", error);
        }
    }

    async countActiveTasksForUser (userId) {
        try {
            const count = await Task.countDocuments({
                assignedUser: userId,
                status: { $in: ["Todo", "In Progress"] }
            })
            return count;
        } catch (error) {
            console.log(error)
            throw new Error("Error counting active tasks for user", error);
        }
    }

    async searchAndFilterTasks({ search, priority, status, assignedUser, createdBy }) {
        const query = {};
        try {
            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } }
                ];
            }
    
            if (priority) query.priority = priority;
            if (status) query.status = status;
    
            const result = await Task.find(query)
            return result;
    
        } catch (error) {
            console.error("Repo error:", error)
            error.message = error.message || "Error finding task"
            throw error;
        }
    }

    async countAll () {
        try {
            const totalTasks = await Task.countDocuments();
            return totalTasks;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

export default TaskRepository;