import express from 'express'

import { authMiddleware } from '../containers/auth.container.js'
import orderController from '../containers/order.container.js'
import OrderMiddleware from '../middlewares/order.middleware.js'

const orderMiddleware = new OrderMiddleware()
const orderRouter = express.Router()

orderRouter.post('/', authMiddleware.auth, orderMiddleware.validateOrder,
    orderController.createOrder)

orderRouter.get('/my-orders', authMiddleware.auth, orderController.getUserOrders)

orderRouter.get('/:id', authMiddleware.auth, orderController.getOrderById)

orderRouter.get('/', authMiddleware.auth, authMiddleware.authorize, orderController.getAllOrders)

orderRouter.patch('/:id/status', authMiddleware.auth, authMiddleware.authorize, orderController.updateOrderStatus)

export default orderRouter