import admin, { verifyIdToken } from "../config/firebase.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing"
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format"
      });
    }

    const token = authHeader.split(" ")[1];

    if (process.env.NODE_ENV !== "production" && token === "local-dev-admin") {
      req.user = {
        uid: "local-dev-admin",
        email: "admin@batchfund.com",
        name: "Batch Fund Admin",
        admin: true
      };

      return next();
    }

    if (process.env.NODE_ENV === "test" && token === "test-admin") {
      req.user = {
        uid: "test-admin",
        email: "admin@batchfund.com",
        name: "Batch Fund Admin",
        admin: true
      };

      return next();
    }

    const decodedToken = await verifyIdToken(token);

    req.user = decodedToken;

    next();

  } catch (err) {

    return res.status(401).json({
      success: false,
      message: "Invalid Token"
    });

  }
};

export default authMiddleware;