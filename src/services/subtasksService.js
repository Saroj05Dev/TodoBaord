class SubTaskService {
    constructor(subtaskRepository,taskRepository, actionService, io) {
        this.subtaskRepository = subtaskRepository;
        this.taskRepository = taskRepository;
        this.actionService = actionService;
        this.io = io;
    }

    async createSubTask (taskId, subtask, userId) {
        const subTask = await this.subtaskRepository.createSubTask({
            ...subtask,
            parentTask: taskId,
            createdBy: userId
        });

        // Real-time emit
        this.io.emit("subtaskCreated", subTask);

        // Action log
        this.actionService.logAndEmit(userId, subTask._id, "subtask_added");

        return subTask;
    }

    async updateSubTask (subtaskId, subtask, userId) {
        const currentSubtask = await this.subtaskRepository.findSubTaskById(subtaskId);

        if (!currentSubtask) {
            const err = new Error("Subtask not found");
            err.statusCode = 404;
            throw err;
        }

        // Only creator or assignedUser can update
        if (
            currentSubtask.createdBy._id.toString() !== userId.toString() &&
            (!currentSubtask.assignedUser || currentSubtask.assignedUser._id.toString() !== userId.toString())
        ) {
            const err = new Error("You are not authorized to update this subtask.");
            err.statusCode = 403;
            throw err;
        }
        const updated = await this.subtaskRepository.updateSubTask(subtaskId, subtask);

        this.io.emit("subtaskUpdated", updated);
        await this.actionService.logAndEmit(userId, updated.parentTask, "subtask_updated");

        return updated;
    }

    async deleteSubTasks (subtaskId, userId) {
        const currentSubtask = await this.subtaskRepository.findSubTaskById(subtaskId);

        if (!currentSubtask) {
            const err = new Error("Subtask not found");
            err.statusCode = 404;
            throw err;
        }

    // Only creator or assignedUser can delete
        if (
            currentSubtask.createdBy._id.toString() !== userId.toString() &&
            (!currentSubtask.assignedUser || currentSubtask.assignedUser._id.toString() !== userId.toString())
        ) {
            const err = new Error("You are not authorized to delete this subtask.");
            err.statusCode = 403;
            throw err;
        }
        
        const deleted = await this.subtaskRepository.deleteSubTask(subtaskId);

        this.io.emit("subtaskDeleted", deleted);
        await this.actionService.logAndEmit(userId, deleted.parentTask, "subtask_deleted");

        return deleted;
    }

    async listSubtasks (taskId, userId) {
        // 1. First check if the uer has access to the parent task
        const parentTask = await this.taskRepository.findTaskById(taskId, userId);
        if (!parentTask) {
            const err = new Error("Parent task not found or you are not authorized to view it.");
            err.statusCode = 404;
            throw err;
        }
        // 2. If authorized then list the subtasks
        return await this.subtaskRepository.getSubTasksByTaskId(taskId);
    }
}

export default SubTaskService;