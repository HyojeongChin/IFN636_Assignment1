require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await User.updateOne({ email: "staff@test.com" }, { $set: { role: "staff" } });
    await User.updateOne({ email: "admin@test.com" }, { $set: { role: "admin" } });
    const users = await User.find({ email: { $in: ["staff@test.com", "admin@test.com"] } }).select("email role");
    console.log("roles updated:", users);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
