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
}

export default UserService;