require("dotenv").config()
import { Request, Response } from "express";
import userModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import asyncHandler from "express-async-handler"
import jwt, { JwtPayload } from "jsonwebtoken";
import ejs from 'ejs'
import path from "path";
import sendMail from "../utils/sendMail";
import { sendToken } from "../utils/jwt";
import redis from "../utils/connectRedis";
import cloudinary from 'cloudinary'

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


// login user

interface ILoginBody {
    email: string;
    password: string;
}

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body as ILoginBody

        if (!email || !password) {
            throw new ErrorHandler("Email and password are required.", 400)
        }

        const user = await userModel.findOne({ email }).select("+password")

        if (!user) {
            throw new ErrorHandler("Invalid email or password", 400)
        }

        const isPasswordMatch = await user.comparePassword(password)

        if (!isPasswordMatch) {
            throw new ErrorHandler("Invalid email or password", 400)
        }

        sendToken(user, 200, res)

    } catch (error: any) {
        throw new ErrorHandler(error.message, 400)
    }
})


// logout user
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    try {
        res.cookie("access_token", "", { maxAge: 1 })
        res.cookie("refresh_token", "", { maxAge: 1 })

        redis.del(req.user._id)
        res.status(200).json({
            success: true,
            message: "Logged out successfully."
        })

    } catch (error: any) {
        throw new ErrorHandler(error.message, 400)
    }
})

// update access token
export const updateAccessToken = asyncHandler(async (req: Request, res: Response) => {
    try {
        const refresh_token = req.cookies.refresh_token
        const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN!) as JwtPayload

        if (!decoded) {
            throw new ErrorHandler("Token is not valid.", 400)
        }

        const user = await userModel.findById(decoded.id)

        if (!user) {
            throw new ErrorHandler("User is not found.", 404)
        }

        sendToken(user, 200, res)

    } catch (error: any) {
        throw new ErrorHandler(error.message, 400)
    }
})

// get user info
export const getUserInfo = asyncHandler(async (req: Request, res: Response) => {
    try {
        const id = req.user._id

        let user;

        user = await redis.get(id)

        if (!user) {
            user = await userModel.findById(id)

            if (!user) {
                throw new ErrorHandler("User is not found.", 404)
            } else {
                redis.set(user._id, JSON.stringify(user))
            }
        }
        user = JSON.parse(user as string)
        res.status(200).json({
            success: true,
            user
        })
    } catch (error: any) {
        throw new ErrorHandler(error.message, 400)
    }
})

interface ISocialBody {
    email: string;
    name: string;
    avatar: string;
}

// social auth
export const socialAuth = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { email, name, avatar } = req.body as ISocialBody
        const user = await userModel.findOne({ email })

        if (user) {
            sendToken(user, 200, res)
        } else {
            const newUser = await userModel.create({ email, name, avatar })
            sendToken(newUser, 200, res)
        }
    } catch (error: any) {
        throw new ErrorHandler(error.message, 400)
    }
})

interface IUpdateUserBody {
    name?: string;
}

// update user info
export const updateUserInfo = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { name } = req.body as IUpdateUserBody
        const userId = req.user._id

        if (!name) {
            throw new ErrorHandler("Name is required.", 400)
        }

        const user = await userModel.findById(userId)

        if (!user) {
            throw new ErrorHandler("User is not found.", 404)
        }

        user.name = name

        await user.save()

        await redis.set(userId, JSON.stringify(user))

        res.status(201).json({
            success: true,
            user
        })

    } catch (error: any) {
        throw new ErrorHandler(error.message, 400)
    }
})

// update user password
interface IUpdatePasswordBody {
    oldPassword: string;
    newPassword: string;
}
export const updateUserPassword = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { oldPassword, newPassword } = req.body as IUpdatePasswordBody

        if (!oldPassword || !newPassword) {
            throw new ErrorHandler("Old password and new password are required.", 404)
        }

        const userId = req.user._id

        const user = await userModel.findById(userId).select("+password")

        if (!user) {
            throw new ErrorHandler("User not found.", 404)
        }

        const isPasswordMatch = await user.comparePassword(oldPassword)

        if (!isPasswordMatch) {
            throw new ErrorHandler("Invalid old password.", 400)
        }

        user.password = newPassword;

        await user.save()

        await redis.set(userId, JSON.stringify(user))

        res.status(201).json({
            success: true,
            user
        })

    } catch (error: any) {
        throw new ErrorHandler(error.message, 400)
    }
})



// update user profile avatar
interface IUpdateAvatarBody {
    avatar: string
}
export const updateUserAvatar = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { avatar } = req.body as IUpdateAvatarBody

        if (!avatar) {
            throw new ErrorHandler("Avatar is required.", 400)
        }

        const userId = req.user._id

        const user = await userModel.findById(userId)

        if (!user) {
            throw new ErrorHandler("User not found.", 404)
        }

        if (user?.avatar?.public_id) {
            await cloudinary.v2.uploader.destroy(user.avatar.public_id)
        }

        const cloudinaryAvatarInfo = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatars",
            width: 150
        })
        user.avatar.public_id = cloudinaryAvatarInfo.public_id
        user.avatar.url = cloudinaryAvatarInfo.url

        await user.save()
        await redis.set(userId, JSON.stringify(user))

        res.status(201).json({
            success: true,
            user
        })

    } catch (error: any) {
        throw new ErrorHandler(error.message, 400)
    }
})

//get all users
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    try {
        const users = await userModel.find().sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            users
        })

    } catch (error: any) {
        throw new ErrorHandler(error.message, 400)
    }
})

//update user role
export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
    try {

        const { id, role } = req.body

        if (!id || !role) {
            throw new ErrorHandler("Id and role are required.", 400)
        }

        const user = await userModel.findById(id)

        if (!user) {
            throw new ErrorHandler("User not found.", 404)
        }

        user.role = role

        await user.save()

        res.status(200).json({
            success: true, user
        })

    } catch (error: any) {
        throw new ErrorHandler(error.message, 400)
    }
})

//delete user --admin
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {

    try {
        const userId = req.params.id

        const user = await userModel.findById(userId)

        if (!user) {
            throw new ErrorHandler("User not found.", 404)
        }

        await userModel.deleteOne({ _id: user._id })

        await redis.del(userId)

        res.status(200).json({
            success: true,
            message: "User successfully deleted."
        })

    } catch (error: any) {
        throw new ErrorHandler(error.message, 400)
    }
})