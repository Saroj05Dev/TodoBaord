class TaskService {
    constructor(taskRepository, actionService, io) {
        this.taskRepository = taskRepository;
        this.actionService = actionService;
        this.io = io;
    }

    async createTask (task, userId) {
        const newTask = await this.taskRepository.createTask(task);
        // Real time task emit
        this.io.emit('taskCreated', newTask);

        // Log the action
        await this.actionService.logAndEmit(userId, newTask._id, "created");

        return newTask;
    }

    async findTask () {
        const tasks = await this.taskRepository.findTask();
        return tasks;
    }

    async findTaskById (taskId) {
        const task = await this.taskRepository.findTaskById(taskId);
        return task;
    }

    async updateTask (taskId, task, userId) {
        const updatedTask = await this.taskRepository.updateTask(taskId, task);

        this.io.emit('taskUpdated', updatedTask);

        await this.actionService.logAndEmit(userId, updatedTask._id, "updated");

        return updatedTask;
    }

    async deleteTask (taskId, userId) {
        const deletedTask = await this.taskRepository.deleteTask(taskId);

        this.io.emit('taskDeleted', deletedTask);

        await this.actionService.logAndEmit(userId, deletedTask._id, "deleted");

        return deletedTask;
    }

    async smartAssign (taskId, userId) {
        // 1. Find all users
        const users = await this.taskRepository.getAllUsers(); // You'll add this in repo

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
}

export default TaskService;