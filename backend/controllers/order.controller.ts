import { Request, Response } from "express";
import orderModel, { IOrder } from "../models/order.model";
import userModel from "../models/user.model";
import courseModel from "../models/course.model";
import notificationModel from "../models/notification.model";
import asyncHandler from 'express-async-handler'
import ErrorHandler from "../utils/ErrorHandler";
import sendMail from "../utils/sendMail";


//create order
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { courseId, payment_info } = req.body as IOrder
        const userId = req.user._id


        if (!courseId) {
            throw new ErrorHandler("All fields are required.", 400)
        }

        const user = await userModel.findById(userId)

        if (!user) {
            throw new ErrorHandler("User not found.", 404)
        }

        const courseInUserCourses = user?.courses.find(co => co.courseId.toString() === courseId.toString())

        if (courseInUserCourses) {
            throw new ErrorHandler("You have already purcahsed this course", 400)
        }

        const course = await courseModel.findById(courseId)

        if (!course) {
            throw new ErrorHandler("Course not found.", 404)
        }

        const data = {
            courseId,
            userId
        }

        const order = await orderModel.create(data)

        const mailData = {
            order: {
                name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString("en-US")
            }
        }

        await sendMail({
            email: user?.email,
            subject: "Order Confirmation",
            template: "order-confirmation.ejs",
            data: mailData
        })

        user.courses.push({ courseId: course._id })

        await user.save()


        if (course.purchased) {
            course.purchased += 1;
            await course.save()
        }

        await notificationModel.create({
            userId,
            title: "New Order",
            status: "pending",
            message: `You have a new order from ${course.name}`
        })

        res.status(201).json({
            success: true,
            order
        })

    } catch (error: any) {
        throw new ErrorHandler(error.message, 400)
    }
})
