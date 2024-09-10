import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary,deleteFromCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
   
    console.log("USER_ID:  ",userId);
    const pipeline = [];
    console.log("Query: ",query);
    

    // for using Full Text based search u need to create a search index in mongoDB atlas
    // you can include field mapppings in search index eg.title, description, as well
    // Field mappings specify which fields within your documents should be indexed for text search.
    // this helps in seraching only in title, desc providing faster search results
    // here the name of search index is 'search-videos'
    if (query) {
        pipeline.push({
            $search: {
                index: "search-videos",
                text: {
                    query: query,
                    path: ["title", "description"] //search only on title, desc
                }
            }
        });
    }

    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid userId");
        }

        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        });
    }

    // fetch videos only that are set isPublished as true
    pipeline.push({ $match: { isPublished: true } });

    //sortBy can be views, createdAt, duration
    //sortType can be ascending(-1) or descending(1)
    if (sortBy && sortType) {
        pipeline.push({
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        });
    } else {
        pipeline.push({ $sort: { createdAt: -1 } });
    }

    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            "avatar.url": 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$ownerDetails"
        }
    )

    const videoAggregate = Video.aggregate(pipeline);
    //The aggregation pipeline defined in pipeline is executed. This pipeline can include various stages like filtering ($match), sorting ($sort), joining with other collections ($lookup), and projecting specific fields ($project).

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const video = await Video.aggregatePaginate(videoAggregate, options);
    //The aggregatePaginate method applies pagination to the results of the aggregation pipeline. It calculates the correct number of documents to skip (based on the page and limit values) and returns only the documents for the requested page.
    // The video variable will hold the result in a paginated format like this
    /* 
    docs: An array of the video documents for the current page.
    totalDocs: The total number of documents matching the aggregation query.
    limit: The number of documents per page.
    page: The current page number.
    totalPages: The total number of pages.
    pagingCounter: The number of the first document on the current page.
    hasPrevPage: A boolean indicating if there is a previous page.
    hasNextPage: A boolean indicating if there is a next page.
    prevPage: The previous page number, if available.
    nextPage: The next page number, if available.

    This structure makes it easy to navigate through the paginated results and display the data in a user-friendly way, such as on a webpage or in an API response.
    */
    return res
        .status(200)
        .json(new ApiResponse(200, video, "Videos fetched successfully"));
})
// get video, upload to cloudinary, create video
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!title && !description){
        throw new ApiError(404,"Enter video title and description")
    }
    // console.log("REQ.FILES:  ",req.files);
    
    //console.log("REQ.FILES.VIDEOFILE:  ",req.files.videoFile);
    
    let thumbnailLocalPath;
    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailLocalPath = req.files.thumbnail[0].path
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400, "Thumbnail is required")
    }
    
    let videoFileLocalPath;
    if(req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0){
        videoFileLocalPath = req.files.videoFile[0].path
    }
    if(!videoFileLocalPath){
        throw new ApiError(400, "Please upload the video")
    }
    
    // upload on cloudinary 
    // const [videoUrl, thumbnailUrl] = await Promise.all([
    //     uploadOnCloudinary(videoFileLocalPath),
    //     uploadOnCloudinary(thumbnailLocalPath)
    // ]);
    const videoFile=await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail=await uploadOnCloudinary(thumbnailLocalPath)


    if(!videoFile){
        throw new ApiError(400, "video not uploaded")
    }
    
    if(!thumbnail){
        throw new ApiError(400, "Thumbnail not uploaded")
    }
    //console.log(videoFile);
    //console.log(thumbnail);

    const videoData = await Video.create({
        title,
        description,
        videoFile : videoFile?.url,
        thumbnail : thumbnail?.url,
        duration : videoFile?.duration,
        owner : req?.user?._id,
        isPublished:false
    })
    
    if(!videoData){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(200)
    .json(new ApiResponse(200, videoData, "Video uploaded successfully"))

})
//This code defines an Express.js controller function getVideoById that retrieves a video by its videoId and returns detailed information about the video, including the owner’s details, like count, and subscription status, while also updating the video’s view count and the user's watch history.
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }
    if (!isValidObjectId(req.user?._id)) {
        throw new ApiError(400, "Invalid userId");
    }
    //TODO: get video by id
    //Aggregation Pipeline to Fetch Video Details
        const video = await Video.aggregate([
            {   //This stage filters the documents to include only the video with the matching videoId.
                $match: {
                    _id: new mongoose.Types.ObjectId(videoId)
                }
            },
            {   //This stage performs a join operation with the likes collection, retrieving all likes associated with the video and storing them in the likes array.
                
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "likes"
                }
            },{  //This stage performs a join operation with the comments collection, retrieving all comments associated with the video and storing them in the comments array.
                $lookup:{
                    from: "comments",
                    localField:"_id",
                    foreignField: "video",
                    as: "comments"
                }
            },

            {    //This stage performs a join operation with the users collection to fetch details of the video owner.
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                        {
                            $lookup: {
                                from: "subscriptions",
                                localField: "_id",
                                foreignField: "channel",
                                as: "subscribers"
                            }
                        },
                        {
                            $addFields: {
                                subscribersCount: {
                                    $size: "$subscribers"
                                },
                                isSubscribed: {
                                    $cond: {
                                        if: {
                                            $in: [
                                                req.user?._id,
                                                "$subscribers.subscriber"
                                            ]
                                        },
                                        then: true,
                                        else: false
                                    }
                                }//whether the current user (req.user._id) is subscribed to the owner’s channel.
                            }
                        },
                        {
                            $project: {
                                username: 1,
                                avatar: 1,
                                subscribersCount: 1,
                                isSubscribed: 1
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    likesCount: {
                        $size: "$likes"//the number of likes on the video.
                    },
                    commentCount:{
                        $size: "$comments"//the number of comments on the video.
                    },
                    owner: {
                        $first: "$owner"//extracts the first element from the owner array (since there should only be one owner).
                    },
                    isLiked: {
                        $cond: {
                            if: {$in: [req.user?._id, "$likes.likedBy"]},
                            then: true,
                            else: false
                        }
                    }//a boolean indicating whether the current user has liked the video
                }
            },
            {   //This stage selects specific fields to be included in the final output, such as videoFile.url, title, description, views, createdAt, duration, comments, owner, likesCount, and isLiked.
                $project: {
                    videoFile: 1,
                    title: 1,
                    description: 1,
                    views: 1,
                    createdAt: 1,
                    duration: 1,
                    comments: 1,
                    owner: 1,
                    likesCount: 1,
                    commentCount:1,
                    isLiked: 1
                }
            }
        ]);
    
        if (!video) {
            throw new ApiError(500, "failed to fetch video");
        }
    
        // increment views if video fetched successfully
        await Video.findByIdAndUpdate(videoId, {
            $inc: {
                views: 1
            }
        });//After successfully fetching the video, this code increments the view count by 1 using $inc.

    
        // add this video to user watch history
        await User.findByIdAndUpdate(req.user?._id, {
            $addToSet: {
                watchHistory: videoId
            }
        });//The video ID is added to the user’s watchHistory array. The $addToSet operator ensures that the video ID is added only if it doesn’t already exist in the array.
    
        return res
            .status(200)
            .json(
                new ApiResponse(200, video[0], "video details fetched successfully")
            );//Finally, the video details are returned to the client. The video[0] is used because the aggregation pipeline returns an array, and we want the first (and only) document.
    

    //OLDER_VERSION
    // const videoData = await Video.findById(videoId)

    // if(!videoData){
    //     throw new ApiErrors(404, "No Video found")
    // }

    // return res.status(200)
    // .json(new ApiResponse(200, videoData, "Video Details fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const { title, description } = req.body;
    const userId = req.user._id;
    
    // Validate title and description
    if (!title || !description) {
        throw new ApiErrors(400, "Enter video title and description");
    }

    // Find the existing video record
    const videoData = await Video.findById(videoId);
    if (!videoData) {
        throw new ApiErrors(404, "Video data not found");
    }
    // Check if the authenticated user is the owner of the video
    if (videoData.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }
    
    let newThumbnailUrl;
    
    if (req.file) {
        const newThumbnailPath = req.file.path;
        console.log(newThumbnailPath);
        
        // Delete the old thumbnail from Cloudinary
        // if (videoData.thumbnail) {
        //     const publicId = getPublicIdFromUrl(videoData.thumbnail); 
        //     await cloudinary.uploader.destroy(publicId, (error, result) => {
        //         if (error) {
        //             console.error("Failed to delete old thumbnail:", error);
        //         } else {
        //             console.log("Old thumbnail deleted:", result);
        //         }
        //     });
        // }
        const deleteThumbnail=await deleteFromCloudinary(videoData.thumbnail)

        // Upload the new thumbnail to Cloudinary
        const thumbnailUploadData = await uploadOnCloudinary(newThumbnailPath);

        if (!thumbnailUploadData) {
            throw new ApiErrors(400, "Thumbnail not uploaded");
        }

        newThumbnailUrl = thumbnailUploadData.url;
    }

    videoData.title = title;
    videoData.description = description;
    if (newThumbnailUrl) {
        videoData.thumbnail = newThumbnailUrl;
    }

    await videoData.save();

    return res.status(200).json(new ApiResponse(200, videoData, "Video data updated successfully"));

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const userId = req.user._id;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    // Check if the authenticated user is the owner of the video
    if (video.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }
  const deleteVideodata= await Video.findByIdAndDelete(videoId)

  if(!deleteVideodata)
  {
    throw new ApiError(200,"Video not Deleted")
  }

  return res
  .status(200)
  .json(new ApiResponse(200, deleteVideodata, "Video deleted successfully"));
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (video?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(
            400,
            "You can't toogle publish status as you are not the owner"
        );
    }
    const toggledVideoPublish = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: true
            }
        },
        { new: true }//The { new: true } option in the findByIdAndUpdate method is used to control what version of the document is returned after the update operation
    );
    if (!toggledVideoPublish) {
        throw new ApiError(500, "Failed to toogle video publish status");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isPublished: toggledVideoPublish.isPublished },
                "Video publish toggled successfully"
            )
        );


})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}