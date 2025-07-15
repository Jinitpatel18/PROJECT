import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { DB_NAME } from '../constants.js'
dotenv.config();

const connectDB = async () => {
    try {
        const connect = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`Connected to MongoDB successfully!  ${connect.connection.host}`);
    } catch (error) {
        console.log("Error in coonecting with mongodb", error);
        process.exit(1);
    }
}

export default connectDB;

