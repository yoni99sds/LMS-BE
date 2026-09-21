import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

const seedInstructor = async () => {
  try {
    // ==========================================
    // CHECK MONGODB URI
    // ==========================================

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env");
    }

    // ==========================================
    // CONNECT TO MONGODB
    // ==========================================

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("=================================");
    console.log("MongoDB connected");
    console.log("=================================");

    // ==========================================
    // CHECK EXISTING INSTRUCTOR
    // ==========================================

    const existingInstructor = await User.findOne({
      email: "instructor@edumaster.com",
    });

    if (existingInstructor) {
      console.log("");
      console.log("=================================");
      console.log("Instructor already exists");
      console.log("=================================");
      console.log("Name:", existingInstructor.fullName);
      console.log("Email:", existingInstructor.email);
      console.log("Role:", existingInstructor.role);
      console.log("Status:", existingInstructor.status);
      console.log("");

      await mongoose.connection.close();

      console.log("MongoDB connection closed");

      return;
    }

    // ==========================================
    // CREATE INSTRUCTOR
    // ==========================================

    const instructor = await User.create({
      firstName: "John",
      lastName: "Instructor",

      email: "instructor@edumaster.com",

      // Your User model automatically hashes
      // the password using the pre-save hook.
      password: "Instructor@123",

      role: "Instructor",

      status: "Active",

      isEmailVerified: true,

      isMfaActive: false,

      profilePicture: "",

      lastLogin: new Date(),
    });

    // ==========================================
    // SUCCESS
    // ==========================================

    console.log("");
    console.log("=================================");
    console.log("Instructor created successfully");
    console.log("=================================");

    console.log("ID:", instructor._id);
    console.log("Name:", instructor.fullName);
    console.log("Email:", instructor.email);
    console.log("Role:", instructor.role);
    console.log("Status:", instructor.status);

    console.log("");
    console.log("---------------------------------");
    console.log("LOGIN CREDENTIALS");
    console.log("---------------------------------");
    console.log("Email: instructor@edumaster.com");
    console.log("Password: Instructor@123");
    console.log("---------------------------------");

    console.log("");
    console.log("Instructor is ready for testing.");
    console.log("=================================");

    // ==========================================
    // CLOSE CONNECTION
    // ==========================================

    await mongoose.connection.close();

    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("");
    console.error("=================================");
    console.error("❌ Instructor seeding failed");
    console.error("=================================");
    console.error(error);
    console.error("");

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    throw error;
  }
};

// IMPORTANT:
// Export the function as DEFAULT because
// app.js imports it as a default import.
export default seedInstructor;