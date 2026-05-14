const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  const { user, pwd } = req.body;

  if (!user || !pwd) {
    return res.status(400).json({ message: "Username and password required" });
  }

  const foundUser = await User.findOne({ username: user }).exec();
  if (!foundUser || foundUser.active === false) {
    return res.sendStatus(401);
  }

  const match = await bcrypt.compare(pwd, foundUser.password);
  if (!match) return res.sendStatus(401);

  const roles = Object.values(foundUser.roles);

  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: foundUser.username,
        roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { username: foundUser.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  foundUser.refreshToken = refreshToken;
  await foundUser.save();

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken });
};

module.exports = { login };
