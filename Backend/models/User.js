import mongoose from "mongoose";
import { USER_TYPES } from "../utils/constants.js";

const UserSchema = new mongoose.Schema(
  {
    userType: {
      type: String,
      required: true,
      enum: Object.values(USER_TYPES),
    },
    userFullName: {
      type: String,
      required: true,
      unique: true,
    },
    admissionId: {
      type: String,
      min: 3,
      max: 15,
      sparse: true,
      unique: true,
    },
    employeeId: {
      type: String,
      min: 3,
      max: 15,
      sparse: true,
      unique: true,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
    },
    dob: {
      type: Date,
    },
    address: {
      type: String,
      default: "",
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    points: {
      type: Number,
      default: 0,
    },
    activeTransactions: [
      {
        type: mongoose.Types.ObjectId,
        ref: "BookTransaction",
      },
    ],
    prevTransactions: [
      {
        type: mongoose.Types.ObjectId,
        ref: "BookTransaction",
      },
    ],
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", UserSchema);