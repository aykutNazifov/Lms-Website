require("dotenv").config()
import mongoose from "mongoose";

const connectDb = () => {
    mongoose.connect(process.env.MONGODB_URI!)
        .then(() => {
            console.log("Mongodb is connected!")
        })
        .catch((err) => {
            console.log("MongoDb connection error", err)
        })
}

export default connectDb
