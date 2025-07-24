import {asyncHandler} from '../utility/asyncHandler.js';
import {ApiError} from '../utility/ApiError.js';
import { User } from '../models/user.models.js';
import { uploadOnCloudinary } from '../utility/cloudinary.js';
import { ApiResponse } from '../utility/ApiResponse.js';

export const registerUser = asyncHandler(async (req, res) => {
    const {username,email,password,fullname} = req.body;

    if([username,email,fullname,password].some(fields => fields?.trim() ==="")){
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne(
        {
            $or: [
                {email},
                {username}
            ]
        }
    )

    if(existingUser){
        throw new ApiError(400, "User already exists with this email or username");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(500, "Avatar upload failed");
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || null,
        email,
        username,
        password
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500, "User creation failed");
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "User created successfully"));
})