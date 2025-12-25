const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (email, username, token) => {
    const verificationLink = `${process.env.BACKEND_URL}/api/users/verify-email?token=${token}`;

    try {
        const data = await resend.emails.send({
            from: 'Whats Cooking <onboarding@resend.dev>', // Başlangıçta bunu kullanabilirsin
            to: email,
            subject: 'Verify Your Email',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e8f5e9; padding: 20px;">
                    <h2 style="color: #1b5e20;">Hoş geldin, ${username}!</h2>
                    <p>Devam etmek için lütfen hesabını doğrula:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" 
                           style="background-color: #4caf50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                           Hesabımı Doğrula
                        </a>
                    </div>
                </div>
            `
        });
        console.log("Mail gönderildi:", data);
        return data;
    } catch (error) {
        console.error("Resend Hatası:", error);
        throw error;
    }
};

module.exports = { sendVerificationEmail };