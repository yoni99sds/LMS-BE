import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    // ==========================================
    // CHECK MONGODB URI
    // ==========================================

    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is not defined in .env"
      );
    }

    // ==========================================
    // CONNECT TO MONGODB
    // ==========================================

    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log("=================================");
    console.log("MongoDB connected");
    console.log("=================================");

    // ==========================================
    // CHECK EXISTING ADMIN
    // ==========================================

    const existingAdmin = await User.findOne({
      email: "yonasgeb09@gmail.com",
    });

    if (existingAdmin) {
      console.log("");
      console.log("=================================");
      console.log("Admin user already exists");
      console.log("=================================");

      console.log(
        "Name:",
        existingAdmin.fullName
      );

      console.log(
        "Email:",
        existingAdmin.email
      );

      console.log(
        "Role:",
        existingAdmin.role
      );

      console.log(
        "Status:",
        existingAdmin.status
      );

      console.log("");

      // ==========================================
      // MAKE SURE USER IS ADMIN
      // ==========================================

      if (existingAdmin.role !== "Admin") {
        existingAdmin.role = "Admin";

        await existingAdmin.save();

        console.log(
          "Existing user's role updated to Admin."
        );
      }

      await mongoose.connection.close();

      console.log(
        "MongoDB connection closed"
      );

      return;
    }

    // ==========================================
    // CREATE ADMIN
    // ==========================================

    const admin = await User.create({
      firstName: "Yonas",
      lastName: "Gebrehiwot",

      email: "yonasgeb09@gmail.com",

      // Your User model automatically hashes
      // the password using the pre-save hook.
      password: "Admin@123",

      role: "Admin",

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
    console.log("Admin created successfully");
    console.log("=================================");

    console.log("ID:", admin._id);
    console.log("Name:", admin.fullName);
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);
    console.log("Status:", admin.status);

    console.log("");
    console.log("---------------------------------");
    console.log("LOGIN CREDENTIALS");
    console.log("---------------------------------");
    console.log(
      "Email: yonasgeb09@gmail.com"
    );
    console.log("Password: Admin@123");
    console.log("---------------------------------");

    console.log("");
    console.log(
      "Admin user is ready for testing."
    );
    console.log("=================================");

    // ==========================================
    // CLOSE CONNECTION
    // ==========================================

    await mongoose.connection.close();

    console.log(
      "MongoDB connection closed"
    );
  } catch (error) {
    console.error("");
    console.error("=================================");
    console.error("❌ Admin seeding failed");
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
// Export as DEFAULT so it can also be
// imported by a central seed runner.
export default seedAdmin;
seedAdmin();