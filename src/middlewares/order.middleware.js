import joi from 'joi'
import AppError from '../utils/AppError.js'

export default class OrderMiddleware {

    validateOrder = (req, res, next) => {

        const orderSchema = joi.object({
            items: joi.array().items(
                joi.object({
                    productId: joi.number().integer().positive().required(),
                    quantity: joi.number().integer().positive().required()
                })
            ).min(1).required()
        })
        
        const { items } = req.body
        const { error } = orderSchema.validate({ items })
        
        if (error) {
            return next(new AppError(error.message, 400))
        }
        next()
    }
}
