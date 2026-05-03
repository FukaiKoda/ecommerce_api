import ProductController from '../controllers/product.controller.js'
import ProductService from '../services/product.service.js'
import ProductRepository from '../repositories/product.repository.js'

const productRepository = new ProductRepository()
const productService = new ProductService(productRepository)
const productController = new ProductController(productService)

export default productController