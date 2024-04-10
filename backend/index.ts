require("dotenv").config()
import express, { NextFunction, Request, Response } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import connectDb from "./utils/connectDb"
import { errorMiddleware } from "./middleware/error"
import ErrorHandler from "./utils/ErrorHandler"
import userRouter from "./routes/user.route"

const app = express()

app.use(express.json({ limit: "50mb" }))
app.use(cookieParser())
app.use(cors({ origin: process.env.ORIGIN }))

// routes
app.use("/api/auth", userRouter)

app.all("*", (req: Request) => {
    throw new ErrorHandler(`Route ${req.originalUrl} not found!`, 404)
})

app.use(errorMiddleware)

const port = process.env.PORT || 8000
app.listen(port, () => {
    console.log(`Server start on port ${port}`)
    connectDb()
})