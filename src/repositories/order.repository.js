import { prisma } from '../config/prisma.js'

export default class OrderRepository {

    createOrder = async (userId, orderItems) => {
        return await prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    userId,
                    items: {
                        create: orderItems.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price
                        }))
                    }
                },
                include: { items: true }
            })

            for (const item of orderItems) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                })
            }

            return order
        })
    }

    getUserOrders = async (userId) => {
        return await prisma.order.findMany({
            where: { userId },
            include: { items: { include: { product: true } } }
        })
    }

    getAllOrders = async () => {
        return await prisma.order.findMany({
            include: {
                items: { include: { product: true } },
                user: { select: { id: true, name: true, email: true } }
            }
        })
    }
    
    getOrderById = async (id) => {
        return await prisma.order.findUnique({
            where: { id },
            include: { items: { include: { product: true } } }
        })
    }

    updateOrderStatus = async (id, status) => {
        return await prisma.order.update({
            where: { id },
            data: { status }
        })
    }
}