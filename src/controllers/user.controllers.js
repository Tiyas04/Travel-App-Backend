import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asynchandler.js";
import ApiResponse from "../utils/apiresponse.js";
import ApiError from "../utils/apierror.js";

const generateAccessandRefreshToken = async (id) => {
    try {
        const existingUser = await User.findById(id)

        const accessToken = existingUser.generateAccessToken()
        const refreshToken = existingUser.generateRefreshToken()
        await existingUser.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, error.message || "Internal server error")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { name, username, email, password } = req.body

    if ([name, username, email, password].some(field => !field || field.trim() === "")) {
        throw new ApiError(401, "All fields are required")
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existingUser) {
        throw new ApiError(401, "User already exists")
    }

    User.create({
        name,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password
    })
        .then((user) => {
            const { password, refreshToken, _id, __v, ...userData } = user._doc

            console.log("User registered successfully\n", userData)

            res
                .status(200)
                .json(new ApiResponse(200, userData, "User Registered successfully"))
        }).catch((error) => {
            throw new ApiError(500, error.message || "Internal Server Error")
        })
})

const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body

    if (!(username) && !password) {
        throw new ApiError(401, "All fields are required")
    }

    const existingUser = await User.findOne({
        $or: [{ username }]
    })

    if (!existingUser) {
        throw new ApiError(404, "No user found")
    }

    const validatePassword = await existingUser.isPasswordCorrect(password)

    if (!validatePassword) {
        throw new ApiError(401, "Invalid credentials")
    }

    const { accessToken, refreshToken } = await generateAccessandRefreshToken(existingUser._id)

    const loggedinUser = await User.findById(existingUser._id).select("-password -_id -__v -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, loggedinUser, "User logged in successfully.")
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.User._id,
        {
            $unset: {
                refreshToken: 1
            }
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "Logged out successfully")
        )
})

export {
    registerUser,
    loginUser,
    logoutUser
}