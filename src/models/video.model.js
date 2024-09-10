import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile: {
            type: String, //cloudinary url
            required: true
        },
        thumbnail: {
            type: String, //cloudinary url
            required: true
        },
        title: {
            type: String, 
            required: true
        },
        description: {
            type: String, 
            required: true
        },
        duration: {
            type: Number, //duration received from cloudinary
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: false
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }

    }, 
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)// now we can use aggregation queries also with normal ones

export const Video = mongoose.model("Video", videoSchema)

//Example of mongooseAggregatePaginate
/* import Video from './models/video.model.js';

const getPaginatedVideos = async (page, limit) => {
    // Define an aggregation pipeline
    const pipeline = [
        {
            $match: { views: { $gte: 100 } }, // Example filter
        },
        {
            $sort: { createdAt: -1 }, // Sort by creation date
        },
        {
            $project: {
                title: 1,
                description: 1,
                views: 1,
            },
        },
    ];

    // Use the aggregatePaginate method
    const options = {
        page: page || 1,
        limit: limit || 10,
    };

    const result = await Video.aggregatePaginate(Video.aggregate(pipeline), options);

    return result;
};

// Usage
getPaginatedVideos(1, 10).then((result) => {
    console.log('Paginated Videos:', result);
}).catch(err => console.error(err));
 */