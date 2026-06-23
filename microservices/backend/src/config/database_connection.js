import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Just pass the URI, no extra options needed!
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // stop server if DB fails
  }
};

export default connectDB;
