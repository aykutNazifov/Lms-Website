import mongoose, { Document } from "mongoose";

export interface IOrder extends Document {
    courseId: string;
    userId: string;
    payment_info: object;
}

const orderSchema = new mongoose.Schema<IOrder>({
    courseId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    payment_info: {
        type: Object,
        // required: true
    }
}, {
    timestamps: true
})

const orderModel = mongoose.model("Order", orderSchema)

export default orderModel;