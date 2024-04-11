import { Request, Response } from "express";
import asyncHandler from "express-async-handler"
import ErrorHandler from "../utils/ErrorHandler";
import clodinary from "cloudinary"
import couseModel, { IComment } from "../models/course.model";
import redis from "../utils/connectRedis";
import sendMail from "../utils/sendMail";


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

// add question in course data
interface IAddQuestionBody {
    question: string;
    courseId: string;
    contentId: string;
}
export const addQestion = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { question, courseId, contentId } = req.body as IAddQuestionBody
        const user = req.user
        const userCourseList = req.user.courses

        const courseExistInCourseList = userCourseList.find((course: { courseId: string }) => course.courseId === courseId)

        if (!courseExistInCourseList) {
            throw new ErrorHandler("You don't have permision to access this course.", 400)
        }

        if (!question || !courseId || !contentId) {
            throw new ErrorHandler("All fields are required.", 400)
        }

        const course = await couseModel.findById(courseId)

        if (!course) {
            throw new ErrorHandler("Course not found.", 404)
        }

        const courseDataContent = course.courseData.find((cData) => cData._id.toString() === contentId.toString())

        if (!courseDataContent) {
            throw new ErrorHandler("Course data not found.", 404)
        }

        const newQuestion: any = {
            user,
            comment: question
        }

        courseDataContent.questions.push(newQuestion)

        await course.save()

        res.status(201).json({
            success: true,
            course
        })

    } catch (error: any) {
        throw new ErrorHandler(error.message, 400)
    }
})

// reply to question
interface IReplyQuestionBody {
    answer: string;
    courseId: string;
    contentId: string;
    questionId: string;
}

export const replyToQuestion = asyncHandler(async (req: Request, res: Response) => {

    try {
        const { answer, courseId, contentId, questionId } = req.body as IReplyQuestionBody
        const user = req.user
        const userCourseList = req.user.courses

        if (!answer || !contentId || !courseId || !questionId) {
            throw new ErrorHandler("All fields are required", 400)
        }


        const courseExistInCourseList = userCourseList.find((course: { courseId: string }) => course.courseId === courseId)

        if (!courseExistInCourseList) {
            throw new ErrorHandler("You don't have permision to access this course.", 400)
        }


        const course = await couseModel.findById(courseId)

        if (!course) {
            throw new ErrorHandler("Course not found.", 404)
        }

        const courseDataContent = course.courseData.find((cData) => cData._id.toString() === contentId.toString())

        if (!courseDataContent) {
            throw new ErrorHandler("Course data not found.", 404)
        }

        const courseDataContentQuestion = courseDataContent.questions?.find((qData) => qData._id.toString() === questionId.toString())


        if (!courseDataContentQuestion) {
            throw new ErrorHandler("Course data question not found.", 404)
        }

        const newReply: any = {
            user,
            comment: answer
        }

        courseDataContentQuestion?.commentReplies?.push(newReply)

        await course.save()

        if (user._id !== courseDataContentQuestion.user._id) {
            const data = {
                name: courseDataContentQuestion.user.name,
                title: courseDataContent.title,
            }

            try {
                await sendMail({
                    email: courseDataContentQuestion.user.email,
                    subject: "Reply to your question",
                    template: "question-reply.ejs",
                    data
                })
            } catch (error: any) {
                throw new ErrorHandler(error.message, 400)
            }
        }

        res.status(201).json({
            success: true,
            course
        })

    } catch (error: any) {
        throw new ErrorHandler(error.message, 400)
    }
})