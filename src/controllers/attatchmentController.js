class AttatchmentController {
    constructor(attatchmentService) {
        this.attatchmentService = attatchmentService;

        this.addAttachment = this.addAttachment.bind(this);
        this.deleteAttatchment = this.deleteAttatchment.bind(this);
    }

    async addAttachment (req, res) {
        try {
            const updatedTask = await this.attatchmentService.addAttatchment(
                req.params.taskId,
                req.user.id,
                req.file
            );

            res.status(200).json({
                success: true,
                message: "Attatchment added successfully",
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

    async deleteAttatchment (req, res) {
        try {
            const updatedTask = await this.attatchmentService.removeAttatchment(
                req.params.taskId,
                req.user.id,
                req.params.publicId
            )

            res.status(200).json({
                success: true,
                message: "Attatchment deleted successfully",
                data: updatedTask,
                error: {}
            })
        } catch (error) {
            res.status(error.statuscode || 500).json({
                success: false,
                message: error.message,
                data: {},
                error: error
            })
        }
    }
}

export default AttatchmentController;