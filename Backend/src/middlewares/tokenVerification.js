import jwt from 'jsonwebtoken';

const tokenVerification = (req, res, next) => {
try {
    // const token = req.cookies?.token;
    // console.log(`tokenVerification=> ${token}`);
    const token = req.signedCookies.token;
    console.log(`tokenVerification=> ${token}`);

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