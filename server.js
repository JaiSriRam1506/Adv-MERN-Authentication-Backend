const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { ConnectMongoDB, ServerConfig } = require("./config/index");
const apiRoutes = require("./routes");

const app = express();

//This is used to get JSON or URLEncoded body from Request for all type of req
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Set middleware of CORS
console.log("Request has Reached at Cors Policy");
app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://yoyoauth-app.vercel.app"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Private-Network", true);
  //  Firefox caps this at 24 hours (86400 seconds). Chromium (starting in v76) caps at 2 hours (7200 seconds). The default value is 5 seconds.
  res.setHeader("Access-Control-Max-Age", 7200);

  next();
});
console.log("Request has Reached at Preflight");

app.options("/*", (_, res) => {
  res.sendStatus(200);
});
// app.options("*", (req, res, next) => {
//   console.log("preflight");
//   if (
//     req.headers.origin === "https://ecommerce-mern-frontend-rho.vercel.app" &&
//     allowMethods.includes(req.headers["access-control-request-method"]) &&
//     allowHeaders.includes(req.headers["access-control-request-headers"])
//   ) {
//     console.log("pass");
//     next();
//   } else {
//     console.log("fail");
//   }
// });
console.log("Request has Reached");
// app.use(
//   cors({
//     // origin: "*",
//     // methods: "*",
//     // allowedHeaders: ["Content-Type", "Authorization"],
//     // credentials: true,

//     origin: ["https://yoyoauth-app.vercel.app", "http://localhost:3000/"],
//     methods: "*",
//     credentials: true,
//     //optionSuccessStatus: 200,
//     preflightContinue: true,
//     //allowedHeaders:"Origin, X-Requested-With, Content-Type,Accept, x-client-key, x-client-token, x-client-secret, Authorization"
//   })
// );
app.use("/api", apiRoutes);

app.listen(ServerConfig.PORT, async () => {
  await ConnectMongoDB.connectMongoDB();
  console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
});
