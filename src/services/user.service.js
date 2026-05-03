import AppError from "../utils/AppError.js";

export default class UserService {

    constructor(userRepository) {
        this.userRepository = userRepository
    }

    ChangeUserRole = async (id, role) => {

        const user = await this.userRepository.ChangeUserRole(id, role)

        if (!user)
            throw new AppError('No Such User', 400)

        return user
    }
}