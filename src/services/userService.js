import jwt from "jsonwebtoken";
import serverConfig from "../config/serverConfig.js"
class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async registerUser (user) {
        const existingUser = await this.userRepository.findUser({
            email: user.email
        });

        if(existingUser) {
            throw {reason: "User with this email already exists", statusCode: 400};
        }

        const newUser = await this.userRepository.createUser(user);

        if(!newUser) {
            throw {reason: "Error creating user", statusCode: 500};
        }

        return newUser;

    }

    async loginUser (authDetails) {
        // Check if there's any registered user with this given email

        const existingUser = await this.userRepository.findUser({
            email: authDetails.email
        });

        if(!existingUser) {
            throw {reason: "User with this email does not exist", statusCode: 404};
        }

        // Create a token and return it
        const token = jwt.sign({ id: existingUser._id, email: existingUser.email }, serverConfig.JWT_SECRET, { expiresIn: serverConfig.JWT_EXPIRES_IN });

        return { token, userData: {
            fullName: existingUser.fullName,
            email: existingUser.email
        }}
    }
}

export default UserService;