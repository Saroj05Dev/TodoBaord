class UserController {
    constructor(userService) {
        this.userService = userService;

        this.createUser = this.createUser.bind(this);
    }

    async createUser (req, res) {
        const user = req.body;
        try {
            const newUser = await this.userService.registerUser(user);
            res.status(201).json({
                success: true,
                message: "User created successfully",
                data: newUser
            })
        } catch (error) {
            console.log(error)
            res.status(error.statusCode || 500).json({
                success: false,
                message: "Error creating user",
                data: {},
            })
        }
    }
}

export default UserController;