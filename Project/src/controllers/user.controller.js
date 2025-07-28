import { asyncHandler } from '../utility/asyncHandler.js';
import { ApiError } from '../utility/ApiError.js';
import User from '../models/user.models.js';
import { uploadOnCloudinary } from '../utility/cloudinary.js';
import { ApiResponse } from '../utility/ApiResponse.js';
import bcrypt from 'bcrypt';

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const refreshToken = user.generateRefreshToken();
        const accessToken = user.generateAccessToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Error generating tokens");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, fullname } = req.body;

    if ([username, email, fullname, password].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        throw new ApiError(400, "User already exists with this email or username");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath); // ✅ safe even if undefined

    if (!avatar) {
        throw new ApiError(500, "Avatar upload failed");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || null,
        email,
        username,
        password
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "User creation failed");
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!username || !email) {
        throw new ApiError(400, "Email and username are required");
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Password is incorrect")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {
            user: loggedUser, accessToken, refreshToken

        },
            "User logged in successfully"
        ))
})

const logoutUser = asyncHandler(async (req, res) => {
    const user = User.findByIdAndUpdate(req.user._id,{
        $set:{
            refreshToken: undefined
        }
    },{
        new: true
    });
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200, user, "User logged out successfully"));
})

export {
    registerUser,
    loginUser,
    logoutUser
}