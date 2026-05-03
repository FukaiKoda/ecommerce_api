import joi from 'joi'
import AppError from '../utils/AppError.js'
import rateLimit from 'express-rate-limit'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/config.js'

export default class AuthMiddleware {

    signUp = (req, res, next) => {

        const userSchema = joi.object({
            name: joi.string().trim().min(5).max(24).required(),
            username: joi.string().trim().min(5).max(10).required(),
            email: joi.string().email().required(),
            password: joi.string().trim().min(7).pattern(new RegExp('^[a-zA-Z0-9_-]{3,30}$')).required()
        })

        const { name, username, email, password } = req.body
        const { error, value } = userSchema.validate({ name, username, email, password })

        if (error) {
            return next(new AppError(error.message, 400))
        }

        req.body = { ...req.body, ...value }
        next()
    }

    logIn = (req, res, next) => {

        const userSchema = joi.object({
            username: joi.string().trim().min(5).max(10).required(),
            password: joi.string().trim().pattern(new RegExp('^[a-zA-Z0-9_-]{3,30}$')).required()
        })

        const { username, password } = req.body
        const { error, value } = userSchema.validate({ username, password })

        if (error) {
            return next(new AppError(error.message, 400))
        }

        req.body = { ...req.body, ...value }
        next()
    }

    loginRateLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 5,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: 'Too many requests from this IP, please try again after 15 minutes.'
    })

    auth = (req, res, next) => {
        
        if (!req.session.userId) {
            return next(new AppError('Missing or invalid credentials', 401))
        }
        next()
    }

    authToken = (req, res, next) => {

        const header = req.headers.authorization

        if (!header) {
          return next(new AppError('Missing token', 401))
        }

        const token = header.split(" ")[1]
        
        try {
            const payload = jwt.verify(token, JWT_SECRET)
            req.user = payload
            next()
        } catch (error) {
            return next(new AppError('Invalid or expired token', 401))
        }
    }

    authorize = (req, res, next) => {
        
        if (req.session.userRole !== 'ADMIN') {
            return next(new AppError('Forbidden', 403)) 
        }
        next()
    }
}
