require("dotenv").config()
import express, { Request } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import connectDb from "./utils/connectDb"
import { errorMiddleware } from "./middleware/error"
import ErrorHandler from "./utils/ErrorHandler"
import userRouter from "./routes/user.route"
import cloudinary from "cloudinary"
import courseRouter from "./routes/course.route"
import orderRouter from "./routes/order.route"
import notificationRouter from "./routes/notification.route"

const app = express()

app.use(express.json({ limit: "50mb" }))
app.use(cookieParser())
app.use(cors({ origin: process.env.ORIGIN }))

// cloudinary config
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
})

// routes
app.use("/api/auth", userRouter)
app.use("/api/course", courseRouter)
app.use("/api/order", orderRouter)
app.use("/api/notification", notificationRouter)

app.all("*", (req: Request) => {
    throw new ErrorHandler(`Route ${req.originalUrl} not found!`, 404)
})

app.use(errorMiddleware)

const port = process.env.PORT || 8000
app.listen(port, () => {
    console.log(`Server start on port ${port}`)
    connectDb()
})