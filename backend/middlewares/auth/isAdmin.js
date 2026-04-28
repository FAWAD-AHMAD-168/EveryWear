import jwt from "jsonwebtoken";
import apiError from "../../utils/apiError.js";

const isAdmin = (req, res, next) => {

    if(req.user.role !== "admin"){
        return next(new apiError(403, "Forbidden! Admins only."));
    }
    next();

};

export default isAdmin;