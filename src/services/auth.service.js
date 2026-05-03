import argon2 from 'argon2'
import AppError from '../utils/AppError.js'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/config.js'

export default class AuthService {

    constructor(authRepository) {
        this.authRepository = authRepository
    }

    signUp = async (userData) => {

        const { name, username, email, password } = userData
        const hash = await argon2.hash(password, { type: argon2.argon2id })

        await this.authRepository.addUser({ name, username, email, password: hash })
    }

    logIn = async (userData) => {

        const { username, password } = userData

        const storedUser = await this.authRepository.findUserByUsername(username)
        
        if (!storedUser) {
            throw new AppError('Invalid Credentials', 401)
        }
        
        const isMatch = await argon2.verify(storedUser.password, password)

        if (!isMatch) {
            throw new AppError('Invalid Credentials', 401)
        }

        return storedUser
    }

    tokenLogin = (userData) => {

        const payload = {
            sub: userData.id,
            role: userData.role
        }
        
        return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' })
    }

    logOut = (session) => {
        return new Promise((resolve, reject) => {
            session.destroy((error) => {
                if (error) {
                    reject(new AppError(error, 400))
                } else {
                    resolve()
                }
            })
        })
    }
}