const env=require('dotenv')
env.config()

module.exports={
    PORT:process.env.PORT,
    MONGO_URI:process.env.MONGO_URI,
    JWT_EXPIRY:process.env.JWT_EXPIRY,
    JWT_SECRET:process.env.JWT_SECRET,
    NODE_ENV:process.env.NODE_ENV,
    SALT_ROUND:process.env.SALT_ROUND,
    OUTLOOK_HOST:process.env.OUTLOOK_HOST,
    OUTLOOK_USER:process.env.OUTLOOK_USER,
    OUTLOOK_PASS:process.env.OUTLOOK_PASS,
    FRONTEND_URL:process.env.FRONTEND_URL,
    CRYPTR_KEY:process.env.CRYPTR_KEY,
    GOOGLE_CLIENT_ID:process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET:process.env.GOOGLE_CLIENT_SECRET
}