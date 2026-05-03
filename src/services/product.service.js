import AppError from '../utils/AppError.js'

export default class ProductService {

    constructor(productRepository) {
        this.productRepository = productRepository
    }

    getProducts = async () => {
        return await this.productRepository.getProducts()
    }

    addProduct = async (productData) => {
        return await this.productRepository.addProduct(productData)
    }

    replaceProduct = async (id, productData) => {
        const product = await this.productRepository.getProductById(id)

        if (!product) {
            throw new AppError('Product not found', 404)
        }

        return await this.productRepository.replaceProduct(id, productData)
    }

    modifyProduct = async (id, productData) => {
        const product = await this.productRepository.getProductById(id)

        if (!product) {
            throw new AppError('Product not found', 404)
        }

        return await this.productRepository.modifyProduct(id, productData)
    }

    removeProduct = async (id) => {
        const product = await this.productRepository.getProductById(id)

        if (!product) {
            throw new AppError('Product not found', 404)
        }

        await this.productRepository.removeProduct(id)
    }
}