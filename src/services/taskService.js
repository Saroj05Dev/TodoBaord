class TaskService {
    constructor(taskRepository) {
        this.taskRepository = taskRepository;
    }

    async createTask (task) {
        const newTask = await this.taskRepository.createTask(task);
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

    async updateTask (taskId, task) {
        const updatedTask = await this.taskRepository.updateTask(taskId, task);
        return updatedTask;
    }

    async deleteTask (taskId) {
        const deletedTask = await this.taskRepository.deleteTask(taskId);
        return deletedTask;
    }
}

export default TaskService;