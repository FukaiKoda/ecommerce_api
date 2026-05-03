import UserController from '../controllers/user.controller.js'
import UserService from '../services/user.service.js'
import UserRepository from '../repositories/user.repository.js'

const userRepository = new UserRepository()
const userService = new UserService(userRepository)
const userController = new UserController(userService)

export default userController