const nodemailer = require(`nodemailer`);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.MAIL_HOST || 'smtp.gmail.com', 
    port: 465, 
    secure: true, 
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    },
});

const sendVerificationEmail = (email, username, token) => {
    const verificationLink = `${process.env.BACKEND_URL}/api/users/verify-email?token=${token}`;

    const mailOptions = {
        from: `"Whats cooking" <${process.env.MAIL_USER}>`,
        to: email,
        subject: `Verify Your Email`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e8f5e9; padding: 20px;">
                <h2 style="color: #1b5e20;">Hoş geldin, ${username}!</h2>
                <p>Yemek tarifleri topluluğumuza katıldığın için mutluyuz. Devam etmek için lütfen hesabını doğrula:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}" 
                       style="background-color: #4caf50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                       Hesabımı Doğrula
                    </a>
                </div>
                <p style="font-size: 12px; color: #666;">Bu link 24 saat boyunca geçerlidir.</p>
            </div>
        `
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Mail Error:", error);
                return reject(error);
            }
            console.log("Mail Sent:", info.response);
            resolve(info);
        });
    });
};

module.exports = { sendVerificationEmail };