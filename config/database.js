const mongoose = require('mongoose')
const { MONGO_URI } = require('./server-config')

const connectMongoDB=async()=>{
    try {
        const res=await mongoose
                          .set('strictQuery',false)
                          .connect(MONGO_URI,{
                            useNewUrlParser:true,
                            useUnifiedTopology:true
                          })
    console.log('MongoDB Connected')
        
    } catch (error) {
        console.log(error)
        process.exit();   
    }
}

module.exports={
    connectMongoDB
}