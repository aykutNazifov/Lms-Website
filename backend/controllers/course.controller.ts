import { Request, Response } from "express";
import asyncHandler from "express-async-handler"
import ErrorHandler from "../utils/ErrorHandler";
import clodinary from "cloudinary"
import couseModel from "../models/course.model";
import redis from "../utils/connectRedis";


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

// edit course 
export const editCourse = asyncHandler(async (req: Request, res: Response) => {
    try {
        const courseId = req.params.id
        const data = req.body

        const course = await couseModel.findById(courseId)

        if (!course) {
            throw new ErrorHandler("Course not found.", 404)
        }

        if (course.thumbnail && data.thumbnail) {
            await clodinary.v2.uploader.destroy(course?.thumbnail?.public_id)

            const cloudinaryThumbnailInfo = await clodinary.v2.uploader.upload(data.thumbnail, { folder: "courses" })

            data.thumbnail = {
                public_id: cloudinaryThumbnailInfo.public_id,
                url: cloudinaryThumbnailInfo.url
            }
        }

        if (!course.thumbnail && data.thumbnail) {
            const cloudinaryThumbnailInfo = await clodinary.v2.uploader.upload(data.thumbnail, { folder: "courses" })

            data.thumbnail = {
                public_id: cloudinaryThumbnailInfo.public_id,
                url: cloudinaryThumbnailInfo.url
            }
        }

        const updatedCourse = await couseModel.findByIdAndUpdate(courseId, data, { new: true })

        res.status(200).json({
            success: true,
            updatedCourse
        })

    } catch (error: any) {
        throw new ErrorHandler(error.message, 400)
    }
})

// get single course -- without purchasing

export const getSingleCourse = asyncHandler(async (req: Request, res: Response) => {
    try {
        const courseId = req.params.id;

        const cachedCourse = await redis.get(courseId)

        if (cachedCourse) {
            res.status(200).json({
                success: true,
                course: JSON.parse(cachedCourse)
            })
        } else {
            const course = await couseModel.findById(courseId).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.usefulLinks")

            if (!course) {
                throw new ErrorHandler("Course not found.", 404)
            }

            await redis.set(courseId, JSON.stringify(course))

            res.status(200).json({
                success: true,
                course
            })
        }
    } catch (error: any) {
        throw new ErrorHandler(error.message, 400)
    }
})

// get all courses 
export const getAllCourses = asyncHandler(async (req: Request, res: Response) => {
    try {

        const cachedCourses = await redis.get("courses")

        if (cachedCourses) {
            res.status(200).json({
                success: true,
                courses: JSON.parse(cachedCourses)
            })
        } else {
            const courses = await couseModel.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.usefulLinks")

            await redis.set("courses", JSON.stringify(courses))

            res.status(200).json({
                success: true,
                courses
            })
        }

    } catch (error: any) {
        throw new ErrorHandler(error.message, 400)
    }
})

// get course content
export const getCourseByUser = asyncHandler(async (req: Request, res: Response) => {
    try {
        const userCourseList = req.user.courses
        const courseId = req.params.id

        const courseExistInCourseList = userCourseList.find((course: { courseId: string }) => course.courseId === courseId)

        if (!courseExistInCourseList) {
            throw new ErrorHandler("You don't have permision to access this course.", 400)
        }

        const course = await couseModel.findById(courseId)

        if (!course) {
            throw new ErrorHandler("Course not found.", 404)
        }

        const content = course.courseData

        res.status(200).json({
            success: true,
            content
        })

    } catch (error: any) {
        throw new ErrorHandler(error.message, 400)
    }
})