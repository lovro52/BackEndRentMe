import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String, required: true },
  location: { type: String, required: true },
});

const Company = mongoose.model("Company", CompanySchema);

export default Company;
