import { Request, Response } from "express";
import asyncHandler from "express-async-handler"
import ErrorHandler from "../utils/ErrorHandler";
import clodinary from "cloudinary"
import couseModel from "../models/course.model";


// upload course
export const uploadCourse = asyncHandler(async (req: Request, res: Response) => {
    try {
        const data = req.body

        if (!data.name || !data.description || !data.price || !data.tags || !data.level) {
            throw new ErrorHandler("Name, description, price, tags and level are required.", 400)
        }

        if (data.thumbnail) {
            const cloudinaryThumbnailInfo = await clodinary.v2.uploader.upload(data.thumbnail, { folder: "courses" })

            data.thumbnail = {
                public_id: cloudinaryThumbnailInfo.public_id,
                url: cloudinaryThumbnailInfo.url
            }
        }

        const course = await couseModel.create(data)

        res.status(201).json({
            success: true,
            course
        })

    } catch (error: any) {
        throw new ErrorHandler(error.message, 400)
    }
})