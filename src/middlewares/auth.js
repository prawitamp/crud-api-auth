const jwt = require("jsonwebtoken")

const token_verify = (req, res, next) => {
  const token = req.header("Authorization");
  
  if(!token) {
    return res.status(401).json("Unauthorized: Missing Token!")
  }

  const token_string = token.replace("Bearer ", "");

  try {
    const dataToken = jwt.verify(token_string, process.env.JWT_SECRET);
    req.user = dataToken;
    next();
  } catch (error) {
    console.error(error.message);
    return res.status(401).json(`Unauthorized: Invalid Token!`)
  }
}

module.exports = token_verify;