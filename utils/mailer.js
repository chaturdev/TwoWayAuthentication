const nodemailer = require('nodemailer');

module.exports=function(senderMailId,passward,log){
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: senderMailId,
          pass: passward
        }
      });
      function sendMail(email, token) {

        return new Promise((resolve,reject)=>{
            var mailOptions = {
                from: senderMailId,
                to: email,
                subject: 'Two Way Authentication token ',
                text: `http://localhost:8000/verify?token=${token}`
              };
            
              transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                  log.error(error);
                  return resolve();
                } else {
                  log.info('Email sent: ' + info.response);
                  return resolve();
                }
              });
        })
      
      }
      return sendMail;
}


  