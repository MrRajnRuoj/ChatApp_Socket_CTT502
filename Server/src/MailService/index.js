const nodemailer = require('nodemailer');
const Events = require('./../Events/Events');
const Error = require('./../Errors/Error');

// const transporter = nodemailer.createTransport({
//     // host: 'smtp.ethereal.email',
//     // port: 587,
//     service: 'Gmail',
//     auth: {
//         user: 'dnue7l2tpxc7artd@ethereal.email',
//         pass: 'CeZKQ6J8YXSJhuEAtM'
//     }
// });

const transporter = nodemailer.createTransport({
    // host: 'smtp.ethereal.email',
    // port: 587,
    service: 'Gmail',
    auth: {
        user: 'accclonedauxanh@gmail.com',
        pass: 'prokilldog'
    }
});

const sendVerifyCode = (socket, code, email, callback) => {
    let message = {
        from: 'Zoola Support <support@zoola.com>', // sender address
        to: email, // list of receivers
        subject: 'Verify your e-mail address', // Subject line
        text: 'Welcome to Zoola!', // plain text body
        html: `<p>Chào mừng bạn đến với Zoola</p>
                <p>Đây là mã xác thực tài khoản: <span>${code}</span></p>` // html body
    };

    transporter.sendMail(message, (error, info) => {
        if (error) {
            socket.emit(Events.RESPONSE_SIGNUP, Error.unknowError());
            return console.log(error);
        }
        callback();
        console.log(info);
    });
}

module.exports = {
    sendVerifyCode
}