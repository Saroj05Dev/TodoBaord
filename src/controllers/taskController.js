class TaskController {
    constructor(taskService) {
        this.taskService = taskService;

        this.createTask = this.createTask.bind(this);
        this.findTask = this.findTask.bind(this);
        this.findTaskById = this.findTaskById.bind(this);
        this.updateTask = this.updateTask.bind(this);
        this.deleteTask = this.deleteTask.bind(this);
    }

    async createTask (req, res) {
        const task = req.body;
        try {
            const newTask = await this.taskService.createTask(task);
            res.status(200).json({
                success: true,
                message: "Task created successfully",
                data: newTask,
                error: {}
            })
        } catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
                data: {},
                error: error
            })
        }
    }

    async findTask (req, res) {
        try {
            const tasks = await this.taskService.findTask();
            res.status(200).json({
                success: true,
                message: "Tasks found successfully",
                data: tasks,
                error: {}
            })
        } catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
                data: {},
                error: error
            })
        }
    }

    async findTaskById (req, res) {
        const taskId = req.params.id;
        try {
            const task = await this.taskService.findTaskById(taskId);
            res.status(200).json({
                success: true,
                message: "Task found successfully",
                data: task,
                error: {}
            })
        } catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
                data: {},
                error: error
            })
        }
    }

    async updateTask (req, res) {
        const taskId = req.params.id;
        const task = req.body;
        try {
            const updatedTask = await this.taskService.updateTask(taskId, task);
            res.status(200).json({
                success: true,
                message: "Task updated successfully",
                data: updatedTask,
                error: {}
            })
        } catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
                data: {},
                error: error
            })
        }
    }

    async deleteTask (req, res) {
        const taskId = req.params.id;
        try {
            const deletedTask = await this.taskService.deleteTask(taskId);
            res.status(200).json({
                success: true,
                message: "Task deleted successfully",
                data: deletedTask,
                error: {}
            })
        } catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
                data: {},
                error: error
            })
        }
    }
}

export default TaskController;