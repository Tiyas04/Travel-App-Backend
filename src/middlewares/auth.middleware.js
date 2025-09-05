import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"
import ApiError from "../utils/apierror.js";
import asyncHandler from "../utils/asynchandler.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
    const token = await req.cookies?.accessToken

    if (!token) {
        throw new ApiError(402, "No active sessions found")
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    const existingUser = await User.findById(decodedToken?._id)

    if (!existingUser) {
        throw new ApiError(402, "No active sessions found")
    }

    req.User = existingUser

    if (!req.User) {
        throw new ApiError(402, "Unauthorized access")
    }

    next()
})

export {
    verifyJWT
}