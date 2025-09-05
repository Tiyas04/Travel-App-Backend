import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asynchandler.js";
import ApiResponse from "../utils/apiresponse.js";
import ApiError from "../utils/apierror.js";

const registerUser = asyncHandler(async (req, res) => {
    const { name, username, email,password } = req.body

    if ([name, username, email,password].some(field => !field || field.trim() === "")) {
        throw new ApiError(401, "All fields are required")
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { contactNumber }]
    })

    if (existingUser) {
        throw new ApiError(401, "User already exists")
    }

    const avatarlocalpath = req.files?.avatar[0]?.path

    if (!avatarlocalpath) {
        throw new ApiError(401, "Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarlocalpath)

    if (!avatar) {
        throw new ApiError(402, "No avatar found")
    }

    User.create({
        name,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        contactNumber,
        dateofbirth,
        role,
        password,
        address,
        avatar: avatar.url,
        specialization: specialization || null
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