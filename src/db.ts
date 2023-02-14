import dotenv from 'dotenv'; 
import mongoose from 'mongoose';

dotenv.config();

mongoose.set('strictQuery', false)

export default {
    connect: async () => {
        try {
            await mongoose.connect(process.env.MONGO_DB_CONNECT!)
            console.log("MongoDB connection created");
        } catch (error) {
            console.log(error)
        }
    }
};