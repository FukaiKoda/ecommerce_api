import { prisma } from '../config/prisma.js';

export default class UserRepository {

    ChangeUserRole = async (id, role) => {
        return await prisma.user.update({
            where: { id: id },
            data: { role: role }
        })
    }
}