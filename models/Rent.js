import mongoose from "mongoose";

const RentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  rentedAt: { type: Date, default: Date.now },
  rentalDays: { type: Number, required: true },
  rentalEndDate: { type: Date, required: true },
});

const Rent = mongoose.model("Rent", RentSchema);

export default Rent;
