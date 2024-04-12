import express from 'express'
import { authorizeRoles, isAuthenticated } from '../middleware/auth';
import { getNotifications, updateNotificationStatus } from '../controllers/notification.controller';

const notificationRouter = express.Router()

notificationRouter.get("/get-notifications", isAuthenticated, authorizeRoles("admin"), getNotifications)
notificationRouter.put("/update-notification-status/:id", isAuthenticated, authorizeRoles("admin"), updateNotificationStatus)

export default notificationRouter;