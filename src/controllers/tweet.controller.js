import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content}=req.body
    if (!content) {
        throw new ApiError(400, "content is required");
    }
    const tweet = await Tweet.create({
        content,
        owner: req.user?._id,
    });
    if (!tweet) {
        throw new ApiError(500, "failed to create tweet please try again");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet created successfully"));
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const userId = req.user?._id
    const tweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 });
    if (!tweets) {
        throw new ApiError(404, "No tweets found");
        }
        return res
        .status(200)
        .json(new ApiResponse(200, tweets, "User tweets retrieved successfully"));
        
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const{content}=req.body
    const {tweetId} = req.params
    if (!content) {
        throw new ApiError(400, "content is required");
    }
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }
    const tweet=await Tweet.findById(tweetId)
    if(!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    if(tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(40, "You are not the owner of this tweet");
    }
    const newTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content,
            },
        },
        { new: true }
    );

    if (!newTweet) {
        throw new ApiError(500, "Failed to edit tweet please try again");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, newTweet, "Tweet updated successfully"));

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "only owner can delete thier tweet");
    }

    await Tweet.findByIdAndDelete(tweetId);

    return res
        .status(200)
        .json(new ApiResponse(200, {tweetId}, "Tweet deleted successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}