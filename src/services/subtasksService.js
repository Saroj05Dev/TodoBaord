class SubTaskService {
    constructor(subtaskRepository, actionService, io) {
        this.subtaskRepository = subtaskRepository;
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
        const updated = await this.subtaskRepository.updateSubTask(subtaskId, subtask);

        this.io.emit("subtaskUpdated", updated);
        await this.actionService.logAndEmit(userId, updated.parentTask, "subtask_updated");

        return updated;
    }

    async deleteSubTasks (subtaskId, userId) {
        const deleted = await this.subtaskRepository.deleteSubTask(subtaskId);

        this.io.emit("subtaskDeleted", deleted);
        await this.actionService.logAndEmit(userId, deleted.parentTask, "subtask_deleted");

        return deleted;
    }

    async listSubtasks (taskId) {
        return await this.subtaskRepository.getSubTasksByTaskId(taskId);
    }
}

export default SubTaskService;