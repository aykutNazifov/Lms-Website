import mongoose, { Document } from "mongoose";

interface INotification extends Document {
    title: string;
    message: string;
    status: string;
    userId: string;
}

const notificationSchema = new mongoose.Schema<INotification>({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    }
}, { timestamps: true })

const notificationModel = mongoose.model("Notification", notificationSchema)

export default notificationModel;