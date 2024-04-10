require("dotenv").config()
import { Request, Response } from "express";
import userModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import asyncHandler from "express-async-handler"
import jwt from "jsonwebtoken";
import ejs from 'ejs'
import path from "path";
import sendMail from "../utils/sendMail";

// register user
interface IRegistrationBody {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

export const registrationUser = asyncHandler(async (req: Request, res: Response) => {

    try {
        const { name, email, password, avatar } = req.body as IRegistrationBody

        if (!name || !email || !password) {
            throw new ErrorHandler("Name, email and password are required.", 400)
        }

        const isEmailExist = await userModel.findOne({ email })

        if (isEmailExist) {
            throw new ErrorHandler("Email already exist.", 400)
        }

        const user = { email, name, password }

        const activationToken = createActivationToken(user)

        const activationCode = activationToken.activationCode

        const data = { user: { name: user.name }, activationCode }

        try {
            await sendMail({
                email: user.email,
                subject: "Activate your account.",
                template: "activation-mail.ejs",
                data: data
            })

            res.status(201).json({
                success: true,
                message: `Please check your email ${user.email} to activate your account.`,
                activationToken: activationToken.token
            })
        } catch (error: any) {
            throw new ErrorHandler(error.message, 400)
        }

    } catch (error: any) {
        throw new ErrorHandler(error.message, 400)
    }
})

interface IActivationToken {
    token: string;
    activationCode: string;
}


const createActivationToken = (user: IRegistrationBody): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString()

    const token = jwt.sign({
        user, activationCode
    }, process.env.ACTIVATION_SECRET!, {
        expiresIn: "5m"
    })

    return {
        token, activationCode
    }
}

// activate user

interface IActivationBody {
    activationToken: string;
    activationCode: string;
}

export const activateUser = asyncHandler(async (req: Request, res: Response) => {
    const { activationCode, activationToken } = req.body as IActivationBody

    if (!activationCode || !activationToken) {
        throw new ErrorHandler("Activation token and Activation code are required!", 400)
    }

    const newUser = jwt.verify(activationToken, process.env.ACTIVATION_SECRET!) as { user: IUser; activationCode: string }

    if (newUser.activationCode !== activationCode.toString()) {
        throw new ErrorHandler("Invalid activation code.", 400)
    }

    const { name, email, password } = newUser.user

    const isEmailExist = await userModel.findOne({ email })

    if (isEmailExist) {
        throw new ErrorHandler("Email already exist!", 400)
    }

    const user = await userModel.create({ name, email, password })

    res.status(201).json({
        success: true,
        message: "Your account is created successfully."
    })

})