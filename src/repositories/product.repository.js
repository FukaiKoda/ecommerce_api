import { prisma } from '../config/prisma.js'

export default class ProductRepository {

    getProducts = async () => {
        return await prisma.product.findMany()
    }

    getProductById = async (id) => {
        return await prisma.product.findUnique({
            where: { id }
        })
    }

    addProduct = async (productData) => {
        return await prisma.product.create({
            data: {
                title: productData.title,
                description: productData.description,
                price: productData.price,
                stock: productData.stock
            }
        })
    }

    replaceProduct = async (id, productData) => {
        return await prisma.product.update({
            where: { id },
            data: {
                title: productData.title,
                description: productData.description,
                price: productData.price,
                stock: productData.stock
            }
        })
    }

    modifyProduct = async (id, productData) => {
        return await prisma.product.update({
            where: { id },
            data: productData
        })
    }

    removeProduct = async (id) => {
        return await prisma.product.delete({
            where: { id }
        })
    }
}
