import jwt from "jsonwebtoken";
import serverConfig from "../config/serverConfig.js";
export async function isLoggedIn(req, res, next) {
    const token = req.cookies.authToken;

    if(!token) {
        return res.status(401).json({
            success: false,
            message: "You are not logged in, please login to continue",
            data: {},
            erro: "Not authenticated"
        })
    }

    try {
        const decoded = jwt.verify(token, serverConfig.JWT_SECRET);

        if(!decoded) {
            return res.status(401).json({
                success: false,
                message: "You are not logged in, please login to continue",
                data: {},
                erro: "Not authenticated"
            })
        }

        req.user = {
            email: decoded.email,
            id: decoded.id,
            // role: decoded.role
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid token provided",
            data: {},
            error: error
        })
    }
}