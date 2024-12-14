const nodemailer = require("nodemailer");


const mailService=(body,email,subject)=>{
         
    
const transporter = nodemailer.createTransport({
  // host: "smtp.ethereal.email",
  // port: 587,
  // secure: false, // true for port 465, false for other ports
  service:"gmail",
  auth: {
    user: "shihas732@gmail.com",
    pass: "lkox ydmj nigs qnlb",
  },
});

// async..await is not allowed in global scope, must use a wrapper
async function main() {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"jobseekers 👻" <shihas732@gmail.com>', // sender address
    to: email, // list of receivers
    subject: subject, // Subject line
    text: body, // plain text body
    // html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}

main().catch(console.error);

}

module.exports =mailService
