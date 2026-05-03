import express from 'express'

import { authMiddleware } from '../containers/auth.container.js'
import productController from '../containers/product.container.js'
import ProductMiddleware from '../middlewares/product.middleware.js'

const productMiddleware = new ProductMiddleware()

const productRouter = express.Router()

productRouter.get('/', authMiddleware.auth, productController.getProducts)

productRouter.post('/', authMiddleware.auth, authMiddleware.authorize,
    productMiddleware.validateFull, productController.addProduct)

productRouter.put('/:id', authMiddleware.auth, authMiddleware.authorize,
    productMiddleware.validateFull, productController.replaceProduct)

productRouter.patch('/:id', authMiddleware.auth, authMiddleware.authorize,
    productMiddleware.validatePartial, productController.modifyProduct)

productRouter.delete('/:id', authMiddleware.auth, authMiddleware.authorize,
    productController.removeProduct)

export default productRouter