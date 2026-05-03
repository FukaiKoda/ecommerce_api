import express from 'express'

import { authMiddleware, authController } from '../containers/auth.container.js'

const mobileRouter = express.Router()

mobileRouter.post('/auth/token', authMiddleware.loginRateLimiter, authController.tokenLogin)

mobileRouter.get('/auth/:anyroute', authMiddleware.authToken/*, mobileRouter.anyroute*/)

export default mobileRouter