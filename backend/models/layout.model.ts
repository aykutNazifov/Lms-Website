import mongoose from "mongoose";

interface IFaqItem extends Document {
    question: string;
    answer: string;
}

interface ICategory extends Document {
    title: string;
}

interface IBannerImage extends Document {
    public_id: string;
    url: string
}

interface ILayout extends Document {
    type: string;
    faq?: IFaqItem[];
    categories?: ICategory[];
    banner?: {
        image: IBannerImage;
        title: string;
        subTitle: string;
    }
}

const faqSchema = new mongoose.Schema<IFaqItem>({
    question: String,
    answer: String
})

const categorySchema = new mongoose.Schema<ICategory>({
    title: String,
})

const bannerImageSchema = new mongoose.Schema<IBannerImage>({
    public_id: String,
    url: String
})

const layoutSchema = new mongoose.Schema<ILayout>({
    type: String,
    faq: [faqSchema],
    categories: [categorySchema],
    banner: {
        image: bannerImageSchema,
        title: String,
        subTitle: String
    }
})

const layoutModel = mongoose.model("Layout", layoutSchema)

export default layoutModel