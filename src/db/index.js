import mongoose from "mongoose";

const connectDB = async () =>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/db`)
        console.log("Database connected successfully")
    } catch (error) {
        console.log("Error:", error.message || "Unable to connect to the database")
    }
}

export default connectDB