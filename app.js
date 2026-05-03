import express from 'express'
import rateLimit from 'express-rate-limit'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import session from 'express-session'

import errorHandler from './src/utils/errorHandler.js'
import mobileRouter from './src/routes/mobile.route.js'
import authRouter from './src/routes/auth.route.js'
import userRouter from './src/routes/user.route.js'
import orderRouter from './src/routes/order.route.js'
import productRouter from './src/routes/product.route.js'

import { SESSION_SECRET, REDIS_URL } from './src/config/config.js'
import { createClient } from 'redis'
import { RedisStore } from 'connect-redis'

const app = express()

app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 150,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
}))

app.use(cors())

app.use(helmet())

app.use(morgan('dev'))

app.use(express.json({ limit: '10kb' }))

app.use(express.static(path.join(import.meta.dirname, 'public')))

const redisClient = createClient({ url: REDIS_URL })

redisClient.on('error', (err) => console.error('Redis Client Error', err))

try { await redisClient.connect() }
catch (err) { process.exit(1) }

app.use(session({
    store: new RedisStore({ client: redisClient }), 
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,        // (XSS protection)
        secure: false,         // sends cookies over https for localhost
        sameSite: 'lax',       // (CSRF protection)
        maxAge: 1000 * 60 * 60 // 1h expiration
    }
}))

app.use('/api/v1/', mobileRouter)

app.use('/auth', authRouter)

app.use('/user', userRouter)

app.use('/orders', orderRouter)

app.use('/products', productRouter)

app.use(errorHandler)

export default app