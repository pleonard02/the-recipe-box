const jwt = require("jsonwebtoken");

function verifyAuthentication(req, res, next) {
    try {
        const authorization = req.headers.authorization;

        if(!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "A Bearer token is required. Authorization denied."
            });
        }

        const token = authorization.split(" ")[1];

        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decodedPayload;

        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ message: "Token is invalid." });
    }
}

module.exports = verifyAuthentication;