const sha256 = require('sha256');
const Events = require('./../../Events/Events');
const Error = require('./../../Errors/Error');
const { sendVerifyCode } = require('./../../MailService');

const validateSignup = (socket, signupData) => {
    if (signupData === null || signupData === undefined) return;
    console.log(signupData);
    try {
        const sql = `SELECT * FROM accounts WHERE email = ${DB.escape(signupData.email)}`;
        DB.query(sql, (err, result) => {
            if (err) {
                socket.emit(Events.RESPONSE_SIGNUP, Error.unknowError());
            }
            else if (result.length > 0) {
                socket.emit(Events.RESPONSE_SIGNUP, Error.emailAlreadyExisted());
            }
            else {
                const sql = `INSERT INTO accounts (email, password, type, created_date, verified) 
                            VALUES (${DB.escape(signupData.email)}, '${sha256(signupData.password)}', 1, NOW(), 0)`;
                DB.query(sql, (err, result) => {
                    if (err) {
                        console.log(err);
                        socket.emit(Events.RESPONSE_SIGNUP, Error.unknowError());
                    }
                    else {
                        const code = Math.round(Math.random() * (9999 - 1000) + 1000);
                        const sql = `INSERT INTO verify_email (email, code) 
                                    VALUES (${DB.escape(signupData.email)}, ${code})`;
                        DB.query(sql, (err, result) => {
                            if (err) {
                                socket.emit(Events.RESPONSE_SIGNUP, Error.unknowError());
                            }
                            else {
                                sendVerifyCode(socket, code, signupData.email, () => {
                                    socket.emit(Events.RESPONSE_SIGNUP, {
                                        error: false,
                                        message: 'VERIFY_ACCOUNT'
                                    });
                                });
                            }
                        });
                    }
                });          
            }
        });
    } catch (error) {
        console.log(error);
    }
}

const verifyEmail = (socket, verifyData) => {
    if (verifyData === null || verifyData === undefined) return;
    try {
        const sql = `SELECT code FROM verify_email WHERE email = ${DB.escape(verifyData.email)}`;
        DB.query(sql, (err, result) => {
            if (err || result.length === 0) {
                socket.emit(Events.RESPONSE_VERIFY_EMAIL, Error.unknowError());
            }
            else if (result[0].code !== verifyData.code) {
                socket.emit(Events.RESPONSE_VERIFY_EMAIL, Error.incorrectVerifyCode());
            }
            else if (result[0].code === verifyData.code) {
                const sql = `UPDATE accounts SET verified = 1 WHERE email = ${DB.escape(verifyData.email)}`;
                DB.query(sql, (err) => {
                    if (err) {
                        socket.emit(Events.RESPONSE_VERIFY_EMAIL, Error.unknowError());
                    }
                    else {
                        socket.emit(Events.RESPONSE_VERIFY_EMAIL, {
                            error: false,
                            message: 'VERIFY_SUCCESSFULLY'
                        });
                        const sql = `DELETE FROM verify_email WHERE email = ${DB.escape(verifyData.email)}`
                        DB.query(sql, (err) => {
                            if (err) {
                                console.log(err);
                            }
                        });
                    }
                });
            }
        });
    } catch (error) {
        console.log(error);
    }
}

const resendVerifyCode = (socket, data) => {
    if (data === null || data === undefined) return;
    try {
        const code = Math.round(Math.random() * (9999 - 1000) + 1000);
        const sql = `UPDATE verify_email SET code = ${code} WHERE email = ${DB.escape(data.email)}`;
        DB.query(sql, (err, result) => {
            if (err) {
                socket.emit(Events.RESPONSE_RESEND_VERIFY_CODE, Error.unknowError());
            }
            else {
                sendVerifyCode(socket, code, data.email, () => {
                    socket.emit(Events.RESPONSE_RESEND_VERIFY_CODE, {
                        error: false,
                        message: 'VERIFY_ACCOUNT'
                    });
                });
            }
        });
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    validateSignup,
    verifyEmail,
    resendVerifyCode
}
