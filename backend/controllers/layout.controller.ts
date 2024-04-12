import { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import ErrorHandler from '../utils/ErrorHandler'
import layoutModel from '../models/layout.model'
import cloudinary from 'cloudinary'

//create layout
export const createLayout = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { type } = req.body

        if (!type) {
            throw new ErrorHandler("Type is required.", 400)
        }

        const isTypeExist = await layoutModel.findOne({ type })

        if (isTypeExist) {
            throw new ErrorHandler("You already create layout with this type.", 400)
        }

        let layout

        switch (type) {
            case "Banner":
                const { image, title, subTitle } = req.body
                if (!image || !title || !subTitle) {
                    throw new ErrorHandler("All fields are required.", 400)
                }
                const cloudinaryData = await cloudinary.v2.uploader.upload(image, {
                    folder: "layout"
                })

                const banner = {
                    image: {
                        public_id: cloudinaryData.public_id,
                        url: cloudinaryData.url
                    },
                    title,
                    subTitle
                }
                layout = await layoutModel.create({
                    type, banner
                })

                res.status(201).json({
                    success: true,
                    layout
                })
                break;
            case "FAQ":
                const { faq } = req.body
                if (!faq) {
                    throw new ErrorHandler("All fields are required.", 400)
                }

                layout = await layoutModel.create({
                    type, faq
                })

                res.status(201).json({
                    success: true,
                    layout
                })
                break;

            case "Categories":
                const { categories } = req.body
                if (!categories) {
                    throw new ErrorHandler("All fields are required.", 400)
                }


                layout = await layoutModel.create({
                    type, categories
                })

                res.status(201).json({
                    success: true,
                    layout
                })
                break;

            default:
                throw new ErrorHandler("Type is not correct.", 400)
        }

    } catch (error: any) {
        throw new ErrorHandler(error.message, error.statusCode || 500)
    }
})

//edit layout 

export const editLayout = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { type } = req.body

        if (!type) {
            throw new ErrorHandler("Type is required.", 400)
        }

        let layout

        switch (type) {
            case "Banner":

                break;
            case "FAQ":
                const faqData = await layoutModel.findOne({ type })

                if (!faqData) {
                    throw new ErrorHandler("Layout not found", 404)
                }
                const { faq } = req.body
                if (!faq) {
                    throw new ErrorHandler("All fields are required.", 400)
                }

                layout = await layoutModel.findByIdAndUpdate(
                    faqData?._id, { faq }
                )

                res.status(201).json({
                    success: true,
                    layout
                })
                break;

            case "Categories":
                const categoriesData = await layoutModel.findOne({ type })

                if (!categoriesData) {
                    throw new ErrorHandler("Layout not found", 404)
                }
                const { categories } = req.body
                if (!categories) {
                    throw new ErrorHandler("All fields are required.", 400)
                }


                layout = await layoutModel.findByIdAndUpdate(
                    categoriesData?._id, { categories }, { new: true }
                )

                res.status(201).json({
                    success: true,
                    layout
                })
                break;

            default:
                throw new ErrorHandler("Type is not correct.", 400)
        }

    } catch (error: any) {
        throw new ErrorHandler(error.message, error.statusCode || 500)
    }
})

//get layout by type 
export const getLayout = asyncHandler(async (req: Request, res: Response) => {
    try {
        const type = req.params.type

        const layout = await layoutModel.findOne({ type })

        if (!layout) {
            throw new ErrorHandler("Layout not found.", 404)
        }

        res.status(200).json({
            success: true,
            layout
        })

    } catch (error: any) {
        throw new ErrorHandler(error.message, error.statusCode || 500)
    }
})