require("dotenv").config()
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler"
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload } from 'jsonwebtoken'
import redis from "../utils/connectRedis";

export const isAuthenticated = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token

    if (!access_token) {
        throw new ErrorHandler("User is not authenticated.", 400)
    }

    const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN!) as JwtPayload


    if (!decoded) {
        throw new ErrorHandler("Access token is not valid", 400)
    }

    const user = await redis.get(decoded.id)

    if (!user) {
        throw new ErrorHandler("User not found.", 400)
    }

    req.user = JSON.parse(user)

    next()
})

export const authorizeRoles = (...roles: string[]) => {
    return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user.role)) {
            throw new ErrorHandler("You are not allowed to access this resource.", 400)
        }
        next()
    })
}