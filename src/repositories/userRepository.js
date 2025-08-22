import User from "../schemas/userSchema.js";

class UserRepository {
    async findUser (parameters) {
        try {
            const existingUser = await User.findOne({ ...parameters });
            return existingUser;
        } catch (error) {
            throw new Error("Error finding user", error);
        }
    }

    async createUser (user) {
        try {
            const newUser = await User.create(user);
            return newUser;
        } catch (error) {
            console.log(error);
            throw new Error("Error creating user", error);
        }
    }

    async countAllUsers () {
        try {
            const totalUsers = await User.countDocuments();
            return totalUsers;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

export default UserRepository;