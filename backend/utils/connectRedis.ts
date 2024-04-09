require("dotenv").config()
import { Redis } from "ioredis"

const redisClient = () => {
    return new Redis(process.env.REDIS_URL!)
}

export default redisClient


