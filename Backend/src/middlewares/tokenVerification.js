import jwt from 'jsonwebtoken';

const tokenVerification = (req, res, next) => {
  try {
    // Check Authorization: Bearer <token> header first, then fall back to signed cookie
    let token = null;
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else {
      token = req.signedCookies.token;
    }
    console.log(`tokenVerification=> ${token ? 'token present' : 'no token'}`);

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded) {
      req.user = decoded;
      return next();
    } else {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.clearCookie('token');
      return res.status(401).json({ message: "Token expired" });
    }
    return res
      .status(401)
      .json({ message: "Token verification failed", error: error.message });
  }
};
export default tokenVerification;