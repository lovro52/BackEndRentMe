import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ["normal", "company"], default: "normal" },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" }, // Only for company users
});

const User = mongoose.model("User", UserSchema);

export default User;
