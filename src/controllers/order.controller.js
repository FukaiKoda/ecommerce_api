export default class OrderController {

    constructor(orderService) {
        this.orderService = orderService
    }

    createOrder = async (req, res, next) => {
        try {
            const userId = req.session.userId
            const { items } = req.body
            
            const order = await this.orderService.createOrder(userId, items)
            res.status(201).json(order)
        }
        catch (error) {
            next(error)
        }
    }

    getUserOrders = async (req, res, next) => {
        try {
            const userId = req.session.userId
            const orders = await this.orderService.getUserOrders(userId)
            res.status(200).json(orders)
        }
        catch (error) {
            next(error)
        }
    }

    getAllOrders = async (req, res, next) => {
        try {
            const orders = await this.orderService.getAllOrders()
            res.status(200).json(orders)
        }
        catch (error) {
            next(error)
        }
    }

    getOrderById = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id)
            const userId = req.session.userId
            const userRole = req.session.userRole

            const order = await this.orderService.getOrderById(id, userId, userRole)
            res.status(200).json(order)
        }
        catch (error) {
            next(error)
        }
    }

    updateOrderStatus = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id)
            const { status } = req.body
            
            const order = await this.orderService.updateOrderStatus(id, status)
            res.status(200).json(order)
        }
        catch (error) {
            next(error)
        }
    }
}