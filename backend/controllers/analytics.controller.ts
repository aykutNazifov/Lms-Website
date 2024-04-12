import { Request, Response } from "express";
import asyncHandler from "express-async-handler"
import ErrorHandler from "../utils/ErrorHandler";
import { generateLast12MonthsData } from "../utils/analytics.generator";
import userModel from "../models/user.model";
import courseModel from "../models/course.model";
import orderModel from "../models/order.model";


// users data analytics 
export const getUsersAnalytics = asyncHandler(async (req: Request, res: Response) => {
    try {
        const usersAnalytic = await generateLast12MonthsData(userModel)

        res.status(200).json({
            success: true,
            usersAnalytic
        })
    } catch (error: any) {
        throw new ErrorHandler(error.message, 500)
    }
})

// courses data analytics 
export const getCoursesAnalytics = asyncHandler(async (req: Request, res: Response) => {
    try {
        const coursesAnalytic = await generateLast12MonthsData(courseModel)

        res.status(200).json({
            success: true,
            coursesAnalytic
        })
    } catch (error: any) {
        throw new ErrorHandler(error.message, 500)
    }
})

// orders data analytics 
export const getOrdersAnalytics = asyncHandler(async (req: Request, res: Response) => {
    try {
        const ordersAnalytic = await generateLast12MonthsData(orderModel)

        res.status(200).json({
            success: true,
            ordersAnalytic
        })
    } catch (error: any) {
        throw new ErrorHandler(error.message, 500)
    }
})