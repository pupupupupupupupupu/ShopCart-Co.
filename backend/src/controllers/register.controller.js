const User = require("../models/User");
const bcrypt = require("bcrypt");
const ROLES = require("../config/roles");

const register = async (req, res) => {
  const { user, pwd } = req.body;

  if (!user || !pwd) {
    return res.status(400).json({ message: "Username and password required" });
  }

  const duplicate = await User.findOne({ username: user }).exec();
  if (duplicate) {
    return res.status(409).json({ message: "Username already exists" });
  }

  const hashedPwd = await bcrypt.hash(pwd, 10);

  const newUser = await User.create({
    username: user,
    password: hashedPwd,
    roles: { User: ROLES.User },
  });

  res.status(201).json({ message: "User registered successfully" });
};

module.exports = { register };
