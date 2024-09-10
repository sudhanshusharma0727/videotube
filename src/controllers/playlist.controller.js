import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import { Video } from "../models/video.model.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if (!name || !description) {
        throw new ApiError(400, "name and description both are required");
    }
    const playlist = await Playlist.create({name, description, owner: req.user?._id})
    if (!playlist) {
        throw new ApiError(500, "failed to create playlist");
    }

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Playlist created successfully"));

    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
        }
        const playlists = await Playlist.find({owner: new mongoose.Types.ObjectId(userId)})
        if (!playlists) {
            throw new ApiError(404, "No playlists found");
            }
            return res
            .status(200)
            .json(new ApiResponse(200, playlists, "User playlists"));

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id");
        }
        const playlist = await Playlist.findById(playlistId)
        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
            }   

    const playlistVideos=await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
                    }
        },
        {
            $lookup: {
                from: "Video",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
                }
        },
        {
            $match:{
                "videos.isPublished": true
            }
        },
        {
            $lookup:{
                from: "User",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
            }
        },
        {
            $addFields: {
                totalVideos: {
                    $size: "$videos"
                },
                totalViews: {
                    $sum: "$videos.views"
                },
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                createdAt: 1,
                updatedAt: 1,
                totalVideos: 1,
                totalViews: 1,
                videos: {
                    _id: 1,
                    videoFile: 1,
                    thumbnail: 1,
                    title: 1,
                    description: 1,
                    duration: 1,
                    createdAt: 1,
                    views: 1
                },
                owner: {
                    username: 1,
                    fullName: 1,
                    avatar: 1
                }
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, playlistVideos[0], "playlist fetched successfully"));
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    //TODO: add video to playlist
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id");
        }
    if (!isValidObjectId(videoId)) {
            throw new ApiError(400, "Invalid video id");
            }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
        }
        const video = await Video.findById(videoId)
        if (!video) {
            throw new ApiError(404, "video not found");
            }
        
            if ((playlist.owner?.toString() && video.owner?.toString()) !==
                req.user?._id.toString() ) {
                throw new ApiError(400, "only owner can add video to thier playlist");
            }

    const updatedPlaylist=await Playlist.findByIdAndUpdate(
        playlist?._id,
        {
            $addToSet:{
                videos:video._id
            },
        },
        {
            new:true
        }
    );
    if (!updatedPlaylist) {
        throw new ApiError(
            400,
            "failed to add video to playlist please try again"
        );
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Added video to playlist successfully"
        )
    );
    
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid PlaylistId or videoId");
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    const video=await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "video not found");
    }
    if ((playlist.owner?.toString() && video.owner?.toString()) !==
    req.user?._id.toString() ) {
        throw new ApiError(400, "only owner can remove video from thier playlist");
        }
        const updatedPlaylist=await Playlist.findByIdAndUpdate
        (
            playlist?._id,
            {
                $pull:{
                    videos:video._id
                    },
                },
                   { new:true }
        );
    if (!updatedPlaylist) {
        throw new ApiError(
            400,
            "failed to remove video from playlist please try again"
            );
            }
            return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    updatedPlaylist,
                    "Removed video from playlist successfully"
                )
            );        


})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid PlaylistId");
        }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
        }
    if (playlist.owner.toString() !== req.user?._id.toString()) {
            throw new ApiError(400, "only owner can delete the playlist");
    }
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)
    if (!deletedPlaylist) {
        throw new ApiError(400, "Failed to delete playlist");
        }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "playlist updated successfully"
            )
        );    


        
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if (!name || !description) {
        throw new ApiError(400, "name and description both are required");
    }
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid PlaylistId");
    }
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "only owner can edit the playlist");
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlist?._id,
        {
            $set: {
                name,
                description,
            },
        },
        { new: true }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "playlist updated successfully"
            )
        );
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}