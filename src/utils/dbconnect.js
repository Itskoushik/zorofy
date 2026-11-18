import mongoose from "mongoose"

const dbConnect = async () => {
    const mongoUrl = process.env.MONGODB_URL || process.env.MONGODB_URI;
    if (!mongoUrl) {
        throw new Error("Please define MONGODB_URL (or MONGODB_URI) in .env.local");
    }
    if (mongoose.connection.readyState === 1) return mongoose.connection;
    if (mongoose.connection.readyState === 2) return mongoose.connection.asPromise();

    return mongoose.connect(mongoUrl, {
        ...(process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {}),
        serverSelectionTimeoutMS: 10000,
    });
}

export default dbConnect;
