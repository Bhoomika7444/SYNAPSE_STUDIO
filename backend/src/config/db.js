import mongoose from "mongoose";

export const connectDB = async () => {
  mongoose.set("strictQuery", true);
  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`MongoDB connected: ${mongoose.connection.host}`);
      return;
    } catch (err) {
      console.warn("Could not connect to configured MONGODB_URI, falling back to MongoMemoryServer:", err.message);
    }
  }

  try {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const mongoServer = await MongoMemoryServer.create({
      binary: { version: "6.0.14" }
    });
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected via MongoMemoryServer at ${mongoUri}`);
  } catch (fallbackErr) {
    console.error("Failed to start MongoMemoryServer:", fallbackErr);
    throw fallbackErr;
  }
};

