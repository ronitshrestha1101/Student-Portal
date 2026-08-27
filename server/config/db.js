import mongoose from 'mongoose';

const connectDB = async () => {
  const uris = [
    process.env.MONGO_URI,
    process.env.MONGODB_URI,
    'mongodb://localhost:27017/student_portal'
  ];

  for (const uri of uris) {
    if (!uri) continue;
    try {
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`Failed to connect: ${error.message}`);
    }
  }

  console.error('All database connection attempts failed');
  process.exit(1);
};

export default connectDB;
