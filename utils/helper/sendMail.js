const nodemailer = require('nodemailer')
const node_handlebar = require('nodemailer-express-handlebars')
const path=require('path')

const sendEmail=async(subject,send_to,sent_from,template,reply_to,name,links,role)=>{
    try {
        const transporter=nodemailer.createTransport({
            host:process.env.OUTLOOK_HOST,
            port:587,
            auth:{
                user:process.env.OUTLOOK_USER,
                pass:process.env.OUTLOOK_PASS
            },
            tls:{
                rejectUnauthorized:false
            }
        })

    // Configure mailgen by setting a theme and product info
    // const mailGenerator = new MailGen({
    //     theme: 'neopolitan',
    //     product: {
    //     name: 'EcommerceApp',
    //     link: 'www.google.com'
    //     // Optional product logo
    //     // logo: 'https://mailgen.js/img/logo.png'
    //      }
    // });

    //Using HandleBars creating Handle Bars Layout
    const handlebarsOptions={
        viewEngine:{
            extName:".handlebars",
            partialDir:path.resolve('./views'),
            defaultLayout:false
        },
        viewPath:path.resolve('./views'),
        extName:".handlebars"
    }

    transporter.use("compile",node_handlebar(handlebarsOptions))
    // const emailTemplate = mailGenerator.generate(template);
    // require('fs').writeFileSync('EmailTemplate.html', emailTemplate, 'utf8');

    const options={
        from:sent_from,
        to:send_to,
        replyTo:reply_to,
        template,
        subject,
        context:{
            name,
            links,
            role
        }
    }
    //Send Mail
    transporter.sendMail(options,function(err,info){
        if(err)console.log("err",err)
        else console.log("Success",info)
    })
        
    } catch (error) {
        console.log("Error",error);        
    }
}

module.exports=sendEmail;