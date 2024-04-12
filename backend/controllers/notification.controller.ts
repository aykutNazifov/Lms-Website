import { Request, Response } from "express";
import notificationModel from "../models/notification.model";
import asyncHandler from 'express-async-handler'
import ErrorHandler from "../utils/ErrorHandler";
import cron from 'node-cron'

//get all notifications
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
    try {
        const notifications = await notificationModel.find().sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            notifications
        })

    } catch (error: any) {
        throw new ErrorHandler(error.message, 400)
    }
})

// update notification status

export const updateNotificationStatus = asyncHandler(async (req: Request, res: Response) => {
    try {
        const notificationId = req.params.id

        const notification = await notificationModel.findById(notificationId)

        if (!notification) {
            throw new ErrorHandler("Notification not found!", 404)
        }

        notification.status = "read"

        await notification.save()

        const notifications = await notificationModel.find().sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            notifications
        })

    } catch (error: any) {
        throw new ErrorHandler(error.message, 400)
    }
})


// delete readed notifications authomatically
cron.schedule("0 0 0 * * *", async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    await notificationModel.deleteMany({ status: "read", createdAt: { $lt: thirtyDaysAgo } })
    console.log("Notificaations deleted.")
})