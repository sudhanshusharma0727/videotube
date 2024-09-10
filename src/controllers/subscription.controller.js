import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!isValidObjectId(channelId))
    {
        throw new ApiError(400,"Invalid channelId")
    }

    const isSubscribed=await Subscription.findOne({
        subscriber:req.user?._id,
        channel:channelId
    })

    if(isSubscribed)
    {
        await Subscription.findByIdAndDelete(isSubscribed._id)

        return res
        .status(200)
        .json(new ApiResponse(200,{subscribed:false},"Unsubscribed Successfully"))

    }

    await Subscription.create({
        subscriber:req.user?._id,
        channel:channelId
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200,{subscribed:true},"Subscribed Successfully")
    )


})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!isValidObjectId(channelId))//The code checks if the channelId is a valid MongoDB ObjectId using the isValidObjectId function.
    {
        throw new ApiError(400, "Invalid channelId");
    }
    // const subscribers = await Subscription.aggregate([
    //     {
    //       $match: {
    //         channel: new mongoose.Types.ObjectId(channelId),
    //       },
    //     },
    //     {
    //       $lookup: {
    //         from: 'users',
    //         localField: 'subscriber',
    //         foreignField: '_id',
    //         as: 'subscriber',
    //       },
    //     },
    //     {
    //       $unwind: '$subscriber',
    //     },
    //     {
    //       $project: {
    //         _id: 0,
    //         subscriber: {
    //           _id: 1,
    //           username: 1,
    //           fullName: 1,
    //           avatar: 1,
    //         },
    //       },
    //     },
    //   ]);
      
    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel:  new mongoose.Types.ObjectId(channelId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",//The name of the output array that will contain the results of the join
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribedToSubscriber",
                        },
                    },
                    {
                        $addFields: {
                            subscribedToSubscriber: {
                                $cond: {
                                    if: {
                                        $in: [
                                            channelId,
                                            "$subscribedToSubscriber.subscriber",
                                        ],
                                    },
                                    then: true,
                                    else: false,
                                },
                            },
                            subscribersCount: {
                                $size: "$subscribedToSubscriber",
                            },
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$subscriber",
        },
        {   
            $project: {
                _id: 0,
                subscriber: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                    subscribedToSubscriber: 1,
                    subscribersCount: 1,
                },
            },
        },

    ]);
// Log the entire subscribers result
//console.log("Subscribers: ", JSON.stringify(subscribers, null, 2));

// Loop over the `subscribers` array to log each `subscribedToSubscriber` field individually
// subscribers.forEach(sub => {
//     console.log("SUBSCRIBED_TO_SUBSCRIBER: ", sub.subscriber.subscribedToSubscriber);
// });    
    
// Loop through the subscribers to log the subscribedToSubscriber array
// subscribers.forEach(sub => {
//     console.log("subscribedToSubscriber array for user", sub.subscriber._id, ":", sub.subscriber.subscribedToSubscriber);
// });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribers,
                "subscribers fetched successfully"
            )
        );
        






    //OLD--------------
    // const subscribers = await Subscription.find({ channel: channelId }).populate("subscriber");
    // return res.status(200).json(new ApiResponse(200, { subscribers }, "Subscribers Retrieved"));
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannel",
                pipeline: [
                    {
                        $lookup: {
                            from: "videos",
                            localField: "_id",
                            foreignField: "owner",
                            as: "videos",
                        },
                    },
                    {
                        $addFields: {
                            latestVideo: {
                                $last: "$videos",
                            },
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$subscribedChannel",
        },
        {
            $project: {
                _id: 0,
                subscribedChannel: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                    latestVideo: {
                        _id: 1,
                        videoFile: 1,
                        thumbnail: 1,
                        owner: 1,
                        title: 1,
                        description: 1,
                        duration: 1,
                        createdAt: 1,
                        views: 1
                    },
                },
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribedChannels,
                "subscribed channels fetched successfully"
            )
        );
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}