import { Request, Response } from "express";
import asyncHandler from "express-async-handler"
import ErrorHandler from "../utils/ErrorHandler";
import clodinary from "cloudinary"
import courseModel, { IComment } from "../models/course.model";
import redis from "../utils/connectRedis";
import sendMail from "../utils/sendMail";
import notificationModel from "../models/notification.model";


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

        const course = await courseModel.create(data)

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

        const course = await courseModel.findById(courseId)

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

        const updatedCourse = await courseModel.findByIdAndUpdate(courseId, data, { new: true })

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
            const course = await courseModel.findById(courseId).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.usefulLinks")

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
            const courses = await courseModel.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.usefulLinks")

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

        const course = await courseModel.findById(courseId)

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

        const course = await courseModel.findById(courseId)

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

        await notificationModel.create({
            userId: user._id,
            title: "New Question",
            status: "unread",
            message: `You have a new question in ${courseDataContent.title}`
        })

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

        const course = await courseModel.findById(courseId)

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

// add review in course

interface IAddReviewBody {
    review: string;
    rating: number;
}

export const addReview = asyncHandler(async (req: Request, res: Response) => {
    try {
        const courseId = req.params.id
        const { review, rating } = req.body as IAddReviewBody

        if (!review || !rating) {
            throw new ErrorHandler("Review and rating are required.", 400)
        }

        const userCourseList = req.user.courses
        const user = req.user

        const courseExistInCourseList = userCourseList.find((course: { courseId: string }) => course.courseId === courseId)

        if (!courseExistInCourseList) {
            throw new ErrorHandler("You don't have permision to access this course.", 400)
        }

        const course = await courseModel.findById(courseId)

        if (!course) {
            throw new ErrorHandler("Course not found.", 404)
        }

        const newReview: any = {
            user,
            comment: review,
            rating
        }

        course.reviews.push(newReview)

        const avg = (course.reviews.reduce((a, r) => a + r.rating, 0)) / course.reviews.length

        course.rating = avg

        await course.save()

        const notification = {
            title: "New Review Received",
            message: `${req.user.name} has given a review in ${course.name}.`
        }

        res.status(201).json({
            success: true,
            course
        })

    } catch (error: any) {
        throw new ErrorHandler(error.message, 400)
    }
})


// add reply in review
interface IReplyReviewBody {
    comment: string;
    reviewId: string;
}

export const replyToReview = asyncHandler(async (req: Request, res: Response) => {
    try {
        const user = req.user
        const courseId = req.params.id
        const { reviewId, comment } = req.body as IReplyReviewBody

        if (!reviewId || !comment) {
            throw new ErrorHandler("All fields are required.", 400)
        }

        const course = await courseModel.findById(courseId)

        if (!course) {
            throw new ErrorHandler("Course not found.", 404)
        }

        const review = course.reviews.find(rew => rew._id.toString() === reviewId.toString())

        if (!review) {
            throw new ErrorHandler("Review not found.", 404)
        }

        const newReviewReply: any = {
            user,
            comment
        }

        review.commentReplies?.push(newReviewReply)

        await course.save()

        res.status(201).json({
            success: true,
            course
        })

    } catch (error: any) {
        throw new ErrorHandler(error.message, 400)
    }
})

//get all courses
export const getAllCoursesAdmin = asyncHandler(async (req: Request, res: Response) => {
    try {
        const courses = await courseModel.find().sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            courses
        })

    } catch (error: any) {
        throw new ErrorHandler(error.message, 400)
    }
})

//delete course --admin
export const deleteCourse = asyncHandler(async (req: Request, res: Response) => {

    try {
        const courseId = req.params.id

        const course = await courseModel.findById(courseId)

        if (!course) {
            throw new ErrorHandler("User not found.", 404)
        }

        await courseModel.deleteOne({ _id: course._id })

        await redis.del(courseId)

        res.status(200).json({
            success: true,
            message: "Course successfully deleted."
        })

    } catch (error: any) {
        throw new ErrorHandler(error.message, 400)
    }
})