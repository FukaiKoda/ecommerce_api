import joi from 'joi'
import AppError from '../utils/AppError.js'

export default class ProductMiddleware {

    validateFull = (req, res, next) => {

        const productSchema = joi.object({
            title: joi.string().required(),
            description: joi.string().required(),
            price: joi.number().positive().required(),
            stock: joi.number().min(0).required()
        })
        const { title, description, price, stock } = req.body
        const { error } = productSchema.validate({ title, description, price, stock })
        
        if (error) {
            return next(new AppError(error.message, 400))
        }
        next()
    }

    validatePartial = (req, res, next) => {

        const productSchema = joi.object({
            title: joi.string(),
            description: joi.string(),
            price: joi.number().positive(),
            stock: joi.number().min(0)
        }).min(1)
        
        const { title, description, price, stock } = req.body
        const payload = Object.fromEntries(Object.entries(
            { title, description, price, stock }
        ).filter(([_, v]) => v !== undefined))
        
        
        const { error } = productSchema.validate(payload)
        
        if (error) {
            return next(new AppError(error.message, 400))
        }
        next()
    }
}
