import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import Company from "./models/Company.js"; // Import Company model
import Vehicle from "./models/Vehicle.js"; // Import Company model
import Rent from "./models/Rent.js"; // Import Company model
import auth from "./middleware/auth.js"; // Import Company model
import User from "./models/User.js"; // Import Company model

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Atlas connection
const dbURI =
  "mongodb+srv://test:test@clustertest.kimvepl.mongodb.net/?retryWrites=true&w=majority&appName=ClusterTest";
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// User registration route
app.post("/register", async (req, res) => {
  const {
    username,
    password,
    email,
    role,
    companyName,
    companyLogo,
    companyLocation,
  } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      role,
    });

    if (role === "company") {
      const newCompany = new Company({
        name: companyName,
        logo: companyLogo,
        location: companyLocation,
      });
      await newCompany.save();
      newUser.companyId = newCompany._id;
    }

    await newUser.save();
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    console.error("Error during user registration:", err);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

// User login route
app.post("/login", async (req, res) => {
  const { emailOrUsername, password } = req.body;

  try {
    console.log(`Login attempt for email or username: ${emailOrUsername}`);
    const user = await User.findOne({
      $or: [{ username: emailOrUsername }, { email: emailOrUsername }],
    });

    if (!user) {
      console.log(`User not found: ${emailOrUsername}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log(`User found: ${emailOrUsername}, role: ${user.role}`);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Password mismatch for user: ${emailOrUsername}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, "YOUR_SECRET_KEY", {
      expiresIn: "1h",
    });
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        companyId: user.companyId,
      },
    });
  } catch (err) {
    console.error("Error during user login:", err);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

// Company routes
app.post("/companies", auth, async (req, res) => {
  const { name, logo, location } = req.body;

  try {
    const newCompany = new Company({ name, logo, location });
    await newCompany.save();
    res.status(201).json({ message: "Company created" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/companies", async (req, res) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Vehicle routes
app.post("/vehicles", async (req, res) => {
  const {
    title,
    type,
    price,
    seats,
    //picture,
    transmission,
    fuelEconomy,
    luggageCapacity,
    companyId,
  } = req.body;

  try {
    console.log("Vehicle creation request:", req.body);

    const newVehicle = new Vehicle({
      title,
      type,
      price,
      seats,
      //picture,
      transmission,
      fuelEconomy,
      luggageCapacity,
      companyId,
    });
    await newVehicle.save();
    res.status(201).json({ message: "Vehicle created" });
  } catch (err) {
    console.error("Error during vehicle creation:", err);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

app.get("/vehicles/company/:companyId", async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ companyId: req.params.companyId });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/vehicles/type/:type", async (req, res) => {
  try {
    console.log(`Fetching vehicles of type: ${req.params.type}`);
    const vehicles = await Vehicle.find({ type: req.params.type });
    res.json(vehicles);
  } catch (err) {
    console.error("Error fetching vehicles by type:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
});
app.get("/vehicles", async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
});
// Rent routes
app.post("/rents", auth, async (req, res) => {
  const { userId, vehicleId, companyId, rentalDays } = req.body;

  try {
    console.log("Rent request data:", {
      userId,
      vehicleId,
      companyId,
      rentalDays,
    });

    const existingRent = await Rent.findOne({ vehicleId });
    if (existingRent) {
      return res.status(400).json({ message: "Vehicle already rented" });
    }

    const rentalEndDate = new Date();
    rentalEndDate.setDate(rentalEndDate.getDate() + rentalDays);

    const newRent = new Rent({
      userId,
      vehicleId,
      companyId,
      rentalDays,
      rentalEndDate,
    });
    await newRent.save();

    await Vehicle.findByIdAndUpdate(vehicleId, { isRented: true });

    res.status(201).json({ message: "Vehicle rented successfully" });
  } catch (err) {
    console.error("Error during vehicle rental:", err);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

app.get("/rents", async (req, res) => {
  try {
    const rents = await Rent.find().populate("userId vehicleId companyId");
    res.json(rents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Profile route
app.get("/profile", auth, async (req, res) => {
  const userId = req.user.id; // Auth middleware sets req.user

  try {
    const user = await User.findById(userId).populate("companyId");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profile = {
      username: user.username,
      email: user.email,
      role: user.role,
    };

    if (user.role === "company") {
      const company = await Company.findById(user.companyId);
      const vehicles = await Vehicle.find({ companyId: company._id });
      profile.company = {
        name: company.name,
        id: company._id,
        vehicles,
      };
    } else {
      const rentals = await Rent.find({ userId }).populate("vehicleId");
      profile.rentals = rentals;
    }

    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* app.get("/profile", auth, async (req, res) => {
  const userId = req.user.id; // Auth middleware sets req.user

  try {
    const user = await User.findById(userId).populate("companyId");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profile = {
      username: user.username,
      email: user.email,
      role: user.role,
    };

    if (user.role === "company") {
      const vehicles = await Vehicle.find({ companyId: user.companyId._id });
      profile.company = {
        name: user.companyId.name,
        vehicles,
      };
    } else {
      const rentals = await Rent.find({ userId }).populate("vehicleId");
      profile.rentals = rentals;
    }

    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}); */

// Add this in your index.js or appropriate route handler file

// Add this in your index.js or appropriate route handler file

app.get("/available-vehicles", async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const rents = await Rent.find({
      $or: [
        {
          rentedAt: { $lt: new Date(startDate) },
          rentalEndDate: { $gt: new Date(startDate) },
        },
        {
          rentedAt: { $lt: new Date(endDate) },
          rentalEndDate: { $gt: new Date(endDate) },
        },
        {
          rentedAt: { $gte: new Date(startDate) },
          rentalEndDate: { $lte: new Date(endDate) },
        },
      ],
    }).select("vehicleId");

    const rentedVehicleIds = rents.map((rent) => rent.vehicleId);
    const vehicles = await Vehicle.find({ _id: { $nin: rentedVehicleIds } });

    res.json({ vehicles, rentedVehicleIds });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Delete routes:

// Delete vehicle route
app.delete("/vehicles/:id", auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    await Vehicle.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch (err) {
    console.error("Error deleting vehicle:", err);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

// Delete rent route
// Delete rent route
app.delete("/rents/:id", auth, async (req, res) => {
  try {
    const rent = await Rent.findById(req.params.id);
    if (!rent) {
      return res.status(404).json({ message: "Rent not found" });
    }

    await Vehicle.findByIdAndUpdate(rent.vehicleId, { isRented: false });
    await Rent.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Rent deleted successfully" });
  } catch (err) {
    console.error("Error deleting rent:", err);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
