import jwt from "jsonwebtoken";
import User from "../../models/userModel.js";
import apiError from "../../utils/apiError.js";

const authMiddleware = async (req, res, next) => {
  try {
    const accessToken =
      req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

    if (!accessToken) {
      return next(new apiError(401, "Unauthorized!"));
    }

    const decoded = jwt.verify(accessToken, process.env.ACCESS_JWT_SECRET);
    const id = decoded.id;
    const user = await User.findById(id);
    if (!user) {
      return next(new apiError(404, "User not found!"));
    }
    req.user = user;
    next();
  } catch (error) {
    return next(new apiError(401, "Unauthorized! Invalid token."));
  }
};
export default authMiddleware;
