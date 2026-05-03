import express from 'express'
import { authMiddleware, authController } from '../containers/auth.container.js'

const authRouter = express.Router()

authRouter.post('/signup', authMiddleware.signUp, authController.signUp)

authRouter.post('/login', authMiddleware.loginRateLimiter, authMiddleware.logIn,
    authController.logIn)

authRouter.post('/logout', authMiddleware.auth, authController.logOut)

export default authRouter