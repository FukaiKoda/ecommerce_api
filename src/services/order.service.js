import AppError from '../utils/AppError.js'

export default class OrderService {

    constructor(orderRepository, productRepository) {
        this.orderRepository = orderRepository
        this.productRepository = productRepository
    }

    createOrder = async (userId, items) => {
        
        if (!items || items.length === 0) {
            throw new AppError('Order must contain at least one item', 400)
        }

        const orderItemsWithPrice = []

        for (const item of items) {
            const product = await this.productRepository.getProductById(item.productId)
            
            if (!product) {
                throw new AppError(`Product with ID ${item.productId} not found`, 404)
            }

            if (product.stock < item.quantity) {
                throw new AppError(`Insufficient stock for product ${product.title}`, 400)
            }

            orderItemsWithPrice.push({
                productId: product.id,
                quantity: item.quantity,
                price: product.price
            })
        }

        return await this.orderRepository.createOrder(userId, orderItemsWithPrice)
    }

    getUserOrders = async (userId) => {
        return await this.orderRepository.getUserOrders(userId)
    }

    getAllOrders = async () => {
        return await this.orderRepository.getAllOrders()
    }

    getOrderById = async (id, userId, role) => {
        
        const order = await this.orderRepository.getOrderById(id)
        
        if (!order) {
            throw new AppError('Order not found', 404)
        }

        if (role !== 'ADMIN' && order.userId !== userId) {
            throw new AppError('Unauthorized to view this order', 403)
        }

        return order
    }

    updateOrderStatus = async (id, status) => {
        
        const order = await this.orderRepository.getOrderById(id)
        
        if (!order) {
            throw new AppError('Order not found', 404)
        }

        return await this.orderRepository.updateOrderStatus(id, status)
    }
}