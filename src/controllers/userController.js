class UserController {
    constructor(userService) {
        this.userService = userService;

        this.createUser = this.createUser.bind(this);
        this.login = this.login.bind(this)
        this.logout = this.logout.bind(this)
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

    async login (req, res) {
        const authDetails = req.body;
        try {
            const user = await this.userService.loginUser(authDetails);

            res.cookie("authToken", user.token, {
                httpOnly: true,
                sameSite: "none",
                secure: false,
                maxAge: 7 * 60 * 60 * 1000 // 7 days
            })

            res.status(200).json({
                success: true,
                message: "User logged in successfully",
                data: user,
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

    async logout (req, res) {
        res.cookie("authToken", "", {
            httpOnly: true,
            sameSite: "none",
            secure: false,
            maxAge: 0
        })

        res.status(200).json({
            success: true,
            message: "User logged out successfully",
            data: {},
            error: {}
        })
    }
}

export default UserController;
