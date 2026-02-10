const User = require("../models/User");
const jwt = require("jsonwebtoken");

const refreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);

  const oldRefreshToken = cookies.jwt;

  const foundUser = await User.findOne({ refreshToken: oldRefreshToken }).exec();
  if (!foundUser) return res.sendStatus(403);

  // Clear old refresh token immediately
  foundUser.refreshToken = "";
  await foundUser.save();

  jwt.verify(
    oldRefreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err || decoded.username !== foundUser.username) {
        return res.sendStatus(403);
      }

      const roles = Object.values(foundUser.roles);

      // 🔐 NEW access token
      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: decoded.username,
            roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      // 🔁 NEW refresh token (ROTATED)
      const newRefreshToken = jwt.sign(
        { username: foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      );

      foundUser.refreshToken = newRefreshToken;
      await foundUser.save();

      res.cookie("jwt", newRefreshToken, {
        httpOnly: true,
        secure: true,
        // secure: false, // for development only
        // secure: process.env.NODE_ENV === "production",
        sameSite: "None",
        // sameSite: "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ accessToken });
    }
  );
};

module.exports = { refreshToken };
