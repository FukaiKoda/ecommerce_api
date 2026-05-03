import express from 'express'

import { authMiddleware } from '../containers/auth.container.js'
import userController from '../containers/user.container.js'

const userRouter = express.Router()

userRouter.post('/:role/:id', authMiddleware.auth, userController.ChangeUserRole)

export default userRouter