import mongoose, { Document } from "mongoose";
import { IUser } from "./user.model";

export interface IComment extends Document {
    user: IUser;
    comment: string;
    commentReplies?: IComment[]
}

interface IReview extends Document {
    user: object;
    rating: number;
    comment: string;
    commentReplies: IComment[];
}

interface IUsefulLink extends Document {
    title: string;
    url: string;
}

interface ICourseData extends Document {
    title: string;
    description: string;
    videoUrl: string;
    videoSection: string;
    videoLength: number;
    videoPlayer: string;
    usefulLinks: IUsefulLink[];
    suggestion: string;
    questions: IComment[];

}

interface ICourse extends Document {
    name: string;
    description: string;
    price: number;
    estimatedPrice?: number;
    thumbnail: { public_id: string, url: string };
    tags: string;
    level: string;
    demoVideoUrl: string;
    benefits: { title: string }[];
    prerequisites: { title: string }[];
    review: IReview[];
    courseData: ICourseData[];
    rating?: number;
    purchased?: number;
}

const reviewSchema = new mongoose.Schema<IReview>({
    user: Object,
    rating: {
        type: Number,
        default: 0
    },
    comment: String
})

const usefulLinkSchema = new mongoose.Schema<IUsefulLink>({
    title: String,
    url: String
})

const commentSchema = new mongoose.Schema<IComment>({
    user: Object,
    comment: String,
    commentReplies: [Object]
})

const courseDataSchema = new mongoose.Schema<ICourseData>({
    title: String,
    description: String,
    videoUrl: String,
    videoSection: String,
    videoLength: String,
    videoPlayer: String,
    usefulLinks: [usefulLinkSchema],
    suggestion: String,
    questions: [commentSchema],
})

const courseSchema = new mongoose.Schema<ICourse>({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    estimatedPrice: Number,
    thumbnail: {
        public_id: String,
        url: String
    },
    tags: {
        type: String,
        required: true
    },
    level: {
        type: String,
        required: true
    },
    demoVideoUrl: String,
    benefits: [Object],
    prerequisites: [Object],
    review: [reviewSchema],
    courseData: [courseDataSchema],
    rating: Number,
    purchased: Number
}, {
    timestamps: true
})

const couseModel = mongoose.model("Course", courseSchema)

export default couseModel;