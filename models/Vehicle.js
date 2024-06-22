import mongoose from "mongoose";

const VehicleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ["van", "car", "scooter", "suv"],
    required: true,
  },
  price: { type: Number, required: true },
  seats: { type: Number, required: true },
  //picture: { type: String, required: true },
  transmission: {
    type: String,
    enum: ["automatic", "manual", "sequential"],
    required: true,
  },
  fuelEconomy: { type: Number, required: true },
  luggageCapacity: { type: Number, required: true },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
});
const Vehicle = mongoose.model("Vehicle", VehicleSchema);

export default Vehicle;
