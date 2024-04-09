import { NextFunction, Request, Response } from "express"

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = res.statusCode || 500
    err.message = err.message || "Internal server error!"

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })
}

