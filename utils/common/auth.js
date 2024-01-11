const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ServerConfig } = require("../../config");
const serverConfig = require("../../config/server-config");

async function createToken(input) {
  try {
    const token = await jwt.sign(input, serverConfig.JWT_SECRET, {
      expiresIn: serverConfig.JWT_EXPIRY,
    });
    return token;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function verifyToken(token) {
  try {
    return await jwt.verify(token, serverConfig.JWT_SECRET);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function checkPassword(plainPassword, encryptedPassword) {
  try {
    return await bcrypt.compare(plainPassword, encryptedPassword);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports = {
  createToken,
  verifyToken,
  checkPassword,
};
