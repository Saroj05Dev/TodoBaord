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
}

export default TaskService;