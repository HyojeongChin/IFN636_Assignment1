require("dotenv").config();
const mongoose = require("mongoose");
const Pass = require("../models/Pass");
(async () => {
  try {
    const passId = process.argv[2];
    if (!passId) throw new Error("usage: node tools/resetPass.js <passId>");
    await mongoose.connect(process.env.MONGO_URI);
    const p = await Pass.findById(passId);
    if (!p) throw new Error("pass not found");
    p.checkedInAt = null; // 사용 플래그 리셋
    await p.save();
    console.log("pass reset:", p._id.toString());
    process.exit(0);
  } catch (e) {
    console.error(e); process.exit(1);
  }
})();
