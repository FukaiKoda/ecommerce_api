import { prisma } from '../config/prisma.js'

export default class AuthRepository {

    addUser = async (userData) => {
        return await prisma.user.create({
            data: {
                name: userData.name,
                username: userData.username,
                email: userData.email,
                password: userData.password
            }
        })
    }

    findUserByUsername = async (username) => {
        return await prisma.user.findUnique({
            where: { username: username }
        })
    }
}