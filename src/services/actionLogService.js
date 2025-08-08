class ActionService {
    constructor(actionRepository, io) {
        this.actionRepository = actionRepository;
        this.io = io;
    }

    async logAndEmit(userId, taskId, actionType) {
        const action = await this.actionRepository.logAction({ 
            user: userId, 
            task: taskId, 
            actionType
        });

        this.io.emit('actionLogged', action);

        return action;
    }

    async getRecentActions() {
        return await this.actionRepository.getRecentActions();
    }
}

export default ActionService;
