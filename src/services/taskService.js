class TaskService {
    constructor(taskRepository, actionService, userRepository, io) {
        this.taskRepository = taskRepository;
        this.actionService = actionService;
        this.userRepository = userRepository;
        this.io = io;
    }

    async createTask (task, userId) {
        const newTask = await this.taskRepository.createTask({...task, createdBy: userId});
        // Real time task emit
        this.io.emit('taskCreated', newTask);

        // Log the action
        await this.actionService.logAndEmit(userId, newTask._id, "created");

        return newTask;
    }

    async findTask (userId) {
        const tasks = await this.taskRepository.findTask(userId);
        return tasks;
    }

    async findTaskById (taskId, userId) {
        const task = await this.taskRepository.findTaskById(taskId, userId);
        if (!task) {
            throw new Error("Task not found or you are not authorized to view it");
        }
        return task;
    }

    async updateTask(taskId, task, userId) {

        // Get current task from DB
        const currentTask = await this.taskRepository.findTaskById(taskId);

        if (!currentTask) {
        const error = new Error("Task not found");
        error.statusCode = 404;
        throw error;
        }

        if (
            !currentTask.createdBy || 
            (currentTask.createdBy.toString() !== userId.toString() &&
            (!currentTask.assignedUser || currentTask.assignedUser.toString() !== userId.toString()))
        ) {
            const error = new Error("You are not authorized to update this task.");
            error.statusCode = 403;
            throw error;
        }

        // Conflict detection: Compare client's lastModified with DB's lastModified
        if (
            task.lastModified &&
            new Date(task.lastModified) < new Date(currentTask.lastModified) &&
            currentTask.updatedBy?.toString() !== userId.toString()
        ) {
            const error = new Error("Conflict detected, task has been modified by another user.");
            error.name = "ConflictError";
            error.task = currentTask; // Send server version
            throw error;
        }


        // Update task
        const updatedTask = await this.taskRepository.updateTask(taskId, {
            ...task,
            lastModified: Date.now(),
            updatedBy: userId
        });

        // Emit real-time update
        this.io.emit('taskUpdated', updatedTask);

        // Log action
        await this.actionService.logAndEmit(userId, updatedTask._id, "updated");

        return updatedTask;

    }

    async deleteTask(taskId, userId) {
        const currentTask = await this.taskRepository.findTaskById(taskId);
        if (!currentTask) {
            throw new Error("Task not found");
        }
        if (currentTask.createdBy.toString() !== userId.toString()) {
            throw new Error("Only the creator can delete this task.");
        }
    
        const deletedTask = await this.taskRepository.deleteTask(taskId);

        this.io.emit('taskDeleted', deletedTask);
        await this.actionService.logAndEmit(userId, deletedTask._id, "deleted");

        return deletedTask;
    }

    async countTasks (userId) {
        return this.taskRepository.countAll(userId);
    }


    async smartAssign (taskId, userId) {
        // 1. Find all users
        const users = await this.taskRepository.getAllUsers();

        const currentTask = await this.taskRepository.findTaskById(taskId);
        if (currentTask.createdBy.toString() !== userId.toString()) {
            const error = new Error("Only the creator can assign this task.");
            error.statusCode = 403;
            throw error;
        }


        // 2. Count active tasks for each user
        const userTaskCounts = await Promise.all(
            users.map(async (user) => {
                const count = await this.taskRepository.countActiveTasksForUser(user._id);
                return { userId: user._id, count: count };
            })
        )

        // 3. Pick user with the lowest count
        const targetUser = userTaskCounts.reduce((minUser, currUser) => 
            currUser.count < minUser.count ? currUser : minUser
        )
        // 4. Update the task's assignedTo field
        const updatedTask = await this.taskRepository.updateTask(taskId, {
            assignedUser: targetUser.userId
        })
        
        // 5. Emit real-time update
        this.io.emit('taskUpdated', updatedTask);

        // 6. Log the action
        await this.actionService.logAndEmit(
            userId, // the user whod triggered smart assign
            updatedTask._id, // the task id
            "assigned" // the action type
        );

        return updatedTask;
    }

    async resolveConflict (taskId, userId, resolutionType, clientTask) {
        // Resolution type merge | overwrite

        const currentTask = await this.taskRepository.findTaskById(taskId);
        if(!currentTask) {
            throw new Error("Task not found");
        }

        if (
            currentTask.createdBy.toString() !== userId.toString() &&
            (!currentTask.assignedUser || currentTask.assignedUser.toString() !== userId.toString())
        ) {
            const error = new Error("You are not authorized to resolve this conflict.");
            error.statusCode = 403;
            throw error;
        }


        let updatedData;

        if(resolutionType === "overwrite") {
            updatedData = {
                ...clientTask,
                lastModified: Date.now()
            }
        } else if(resolutionType === "merge") {
            updatedData = {
                ...currentTask.toObject(),
                ...clientTask, // client changes overwrite fields
                lastModified: Date.now()
            }
        } else {
            throw new Error("Invalid resolution type");
        }

        const updatedTask = await this.taskRepository.updateTask(taskId, updatedData);

        this.io.emit('taskUpdated', updatedTask);

        await this.actionService.logAndEmit(userId, updatedTask._id, "updated");

        return updatedTask;
    }

    async searchAndFilterTasks (filters) {
        return await this.taskRepository.searchAndFilterTasks(filters);
    }
}

export default TaskService;