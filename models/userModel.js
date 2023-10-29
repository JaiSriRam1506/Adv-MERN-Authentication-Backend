const mongoose=require('mongoose')
const {ENUMS}=require('../utils/common')
const {SUBSCRIBER,ADMIN,SUSPENDED,AUTHOR}=ENUMS.ROLE_TYPE
const bcrypt=require('bcrypt')
const { ServerConfig } = require('../config')

const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please add a name'],
        trim:true
    },
    email:{
        type:String,
        required:[true,'Please add a email'],
        trim:true,
        unique:true,
        match:[
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please enter a valid email",]
    },
    password: {
        type: String,
        required: [true, "Please add a password"],
        minLength: [6, "Password must be up to 6 characters"],
        //maxLength:[23,'Password must not be greater than 23 Character']
      },
      role: {
        type: String,
        required: [true],
        default: SUBSCRIBER,
        enum: [SUBSCRIBER,AUTHOR,ADMIN,SUSPENDED],
      },
      photo: {
        type: String,
        required: [true, "Please add a photo"],
        default: "https://i.ibb.co/4pDNDk1/avatar.png",
      },
      phone: {
        type: String,
        default: "999999999",
      },
      bio:{
        type:String,
        required:true,
        default:'Bio'
      },
      isVerified:{
        type:Boolean,
        default:false
      },
      userAgent:{
        type:Array,
        required:true,
        default:[]
      }
},
{
    timestamps:true,
    minimize:true
}
)

userSchema.pre('save',async function(next){
  if(!this.isModified('password'))return next();
  //Hash the password
  const encryptedPassword=await bcrypt.hashSync(this.password,+ServerConfig.SALT_ROUND)
  this.password=encryptedPassword;
  next()
})
const User=mongoose.model('User',userSchema);
module.exports=User;