class SubTaskService {
    constructor(subtaskRepository, taskRepository, actionService, io) {
        this.subtaskRepository = subtaskRepository;
        this.taskRepository = taskRepository;
        this.actionService = actionService;
        this.io = io;
    }

    async createSubTask (taskId, subtask, userId) {
        // First check if the user has access to the parent task
        const parentTask = await this.taskRepository.findTaskById(taskId);
        if (!parentTask) {
            const error = new Error("Parent task not found.");
            error.statusCode = 404;
            throw error;
        }

        // Check if the user is authorized to create a subtask on this parent task
        const createdById = parentTask.createdBy?._id?.toString() || parentTask.createdBy?.toString();
        const assignedUserId = parentTask.assignedUser?._id?.toString() || parentTask.assignedUser?.toString();
        
        if (createdById !== userId.toString() && assignedUserId !== userId.toString()) {
            const error = new Error("You are not authorized to create a subtask on this task.");
            error.statusCode = 403;
            throw error;
        }

        const created = await this.subtaskRepository.createSubTask({
            ...subtask,
            parentTask: taskId,
            createdBy: userId
        });

        // Real-time emit
        this.io.emit("subtaskCreated", created);

        // Action log
        this.actionService.logAndEmit(userId, created._id, "subtask_added", { subtaskTitle: subtask.title });

        return created;
    }

    async updateSubTask (subtaskId, subtask, userId) {
        const currentSubtask = await this.subtaskRepository.findSubTaskById(subtaskId);

        if (!currentSubtask) {
            const err = new Error("Subtask not found");
            err.statusCode = 404;
            throw err;
        }
        
        const parentTask = await this.taskRepository.findTaskById(currentSubtask.parentTask);
        if (!parentTask) {
            const error = new Error("Parent task not found.");
            error.statusCode = 404;
            throw error;
        }

        // Only creator or assignedUser of the PARENT task can update
        const createdById = parentTask.createdBy?._id?.toString() || parentTask.createdBy?.toString();
        const assignedUserId = parentTask.assignedUser?._id?.toString() || parentTask.assignedUser?.toString();
        
        if (createdById !== userId.toString() && assignedUserId !== userId.toString()) {
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
        
        const parentTask = await this.taskRepository.findTaskById(currentSubtask.parentTask);
        if (!parentTask) {
            const error = new Error("Parent task not found.");
            error.statusCode = 404;
            throw error;
        }

        // Only creator or assignedUser of the PARENT task can delete
        const createdById = parentTask.createdBy?._id?.toString() || parentTask.createdBy?.toString();
        const assignedUserId = parentTask.assignedUser?._id?.toString() || parentTask.assignedUser?.toString();
        
        if (createdById !== userId.toString() && assignedUserId !== userId.toString()) {
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
        // 1. First check if the user has access to the parent task
        const parentTask = await this.taskRepository.findTaskById(taskId);
        if (!parentTask) {
            const err = new Error("Parent task not found or you are not authorized to view it.");
            err.statusCode = 404;
            throw err;
        }
        
        // 2. Check if the user is authorized to view the subtasks
        const createdById = parentTask.createdBy?._id?.toString() || parentTask.createdBy?.toString();
        const assignedUserId = parentTask.assignedUser?._id?.toString() || parentTask.assignedUser?.toString();

        if (createdById !== userId.toString() && assignedUserId !== userId.toString()) {
            const error = new Error("You are not authorized to view the subtasks for this parent task.");
            error.statusCode = 403;
            throw error;
        }
        
        // 3. If authorized, then list the subtasks
        return await this.subtaskRepository.getSubTasksByTaskId(taskId);
    }
}

export default SubTaskService;