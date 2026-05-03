import dotenv from 'dotenv'

dotenv.config()

const required = [
    'PORT', 'HOST', 'DATABASE_URL', 'REDIS_URL',
    'SESSION_SECRET', 'JWT_SECRET']

required.forEach((key) => {
    if (!process.env[key])
        throw new Error(`Missing required environment variable: ${key}`)
})

export const PORT = process.env.PORT
export const HOST = process.env.HOST

export const SESSION_SECRET = process.env.SESSION_SECRET
export const JWT_SECRET = process.env.JWT_SECRET

export const DATABASE_URL = process.env.DATABASE_URL
export const REDIS_URL = process.env.REDIS_URL