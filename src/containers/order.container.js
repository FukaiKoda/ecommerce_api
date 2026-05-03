import OrderController from '../controllers/order.controller.js'
import OrderService from '../services/order.service.js'
import OrderRepository from '../repositories/order.repository.js'
import ProductRepository from '../repositories/product.repository.js'

const orderRepository = new OrderRepository()
const productRepository = new ProductRepository()
const orderService = new OrderService(orderRepository, productRepository)
const orderController = new OrderController(orderService)

export default orderController