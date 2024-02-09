const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ServerConfig } = require("../../config");
const serverConfig = require("../../config/server-config");

function createToken(input) {
  try {
    const token = jwt.sign(input, serverConfig.JWT_SECRET, {
      expiresIn: serverConfig.JWT_EXPIRY,
    });
    return token;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

function verifyToken(token) {
  try {
    return jwt.verify(token, ServerConfig.JWT_SECRET);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

function checkPassword(plainPassword, encryptedPassword) {
  try {
    return bcrypt.compareSync(plainPassword, encryptedPassword);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createToken,
  verifyToken,
  checkPassword,
};
