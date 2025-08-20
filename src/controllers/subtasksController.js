class SubTaskController {
    constructor (subtaskService) {
        this.subtaskService = subtaskService;

        this.createSubTask = this.createSubTask.bind(this);
        this.updateSubTask = this.updateSubTask.bind(this);
        this.deleteSubTask = this.deleteSubTask.bind(this);
        this.listSubtasks = this.listSubtasks.bind(this);
    }

    async createSubTask (req, res) {
        const { taskId } = req.params;
        const subtask = req.body;
        const userId = req.user.id
        try {
            const created = await this.subtaskService.createSubTask(taskId, subtask, userId);

            res.status(201).json({
                success: true,
                message: "Subtask created successfully",
                data: created,
                error: {}
            })
        } catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
                data: {},
                error
            })
        }
    }

    async updateSubTask (req, res) {
        const { subtaskId } = req.params;
        const subtask = req.body;
        const userId = req.user.id
        try {
            const updated = await this.subtaskService.updateSubTask(subtaskId, subtask, userId);

            res.status(200).json({
                success: true,
                message: "Subtask updated successfully",
                data: updated,
                error: {}
            })
        } catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
                data: {},
                error
            })
        }
    }

    async deleteSubTask (req, res) {
        const { subtaskId } = req.params;
        const userId = req.user.id
        try {
            const deleted = await this.subtaskService.deleteSubTasks(subtaskId, userId);

            res.status(200).json({
                success: true,
                message: "Subtask deleted successfully",
                data: deleted,
                error: {}
            })
        } catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
                data: {},
                error
            })
        }
    }

    async listSubtasks (req, res) {
        const { taskId } = req.params;
        const userId = req.user.id;
        try {
            const subtasks = await this.subtaskService.listSubtasks(taskId, userId);

            res.status(200).json({
                success: true,
                message: "Subtasks found successfully",
                data: subtasks,
                error: {}
            })
        } catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
                data: {},
                error
            })
        }
    }
}

export default SubTaskController;