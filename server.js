const express=require('express')
const mongoose=require('mongoose')
const cors=require('cors')
const bodyParser=require('body-parser')
const cookieParser=require('cookie-parser')
const {ConnectMongoDB, ServerConfig}=require('./config/index')
const apiRoutes=require('./routes')

const app = express();

//This is used to get JSON or URLEncoded body from Request for all type of req
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(
    cors({
        origin:'http://localhost:3000',
        credentials:true,
        optionSuccessStatus:200
    })
)
app.use('/api', apiRoutes);


app.listen(ServerConfig.PORT, async() => {
    await ConnectMongoDB.connectMongoDB();
    console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
});
