export default class ProductController {

    constructor(productService) {
        this.productService = productService
    }

    getProducts = async (req, res, next) => {

        try {
            const products = await this.productService.getProducts()
            res.status(200).json(products)
        }
        catch (error) {
            next(error)
        }
    }

    addProduct = async (req, res, next) => {

        const { title, description, price, stock } = req.body

        try {
            const product = await this.productService.addProduct({ title, description, price, stock })
            res.status(201).json(product)
        }
        catch (error) {
            next(error)
        }
    }

    replaceProduct = async (req, res, next) => {

        const id = parseInt(req.params.id)
        const { title, description, price, stock } = req.body

        try {
            const product = await this.productService.replaceProduct(id, { title, description, price, stock })
            res.status(200).json(product)
        }
        catch (error) {
            next(error)
        }
    }

    modifyProduct = async (req, res, next) => {

        const id = parseInt(req.params.id)
        const { title, description, price, stock } = req.body

        try {
            const product = await this.productService.modifyProduct(id, { title, description, price, stock })
            res.status(200).json(product)
        }
        catch (error) {
            next(error)
        }
    }

    removeProduct = async (req, res, next) => {

        const id = parseInt(req.params.id)

        try {
            await this.productService.removeProduct(id)
            res.status(200).json({ success: 'Product deleted successfully' })
        }
        catch (error) {
            next(error)
        }
    }
}