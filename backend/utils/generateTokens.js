import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.ACCESS_JWT_SECRET,
    { expiresIn: process.env.ACCESS_JWT_EXPIRES_IN }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.REFRESH_JWT_SECRET,
    { expiresIn: process.env.REFRESH_JWT_EXPIRES_IN }
  );
}
export { generateAccessToken , generateRefreshToken };
