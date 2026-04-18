const nodemailer = require('nodemailer');

let transporter = null;
let testAccount = null;

async function getTransporter() {
    if (transporter) return transporter;

    // Create Ethereal test account (auto-generated, free)
    testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });

    console.log('Ethereal Email Account Created:');
    console.log(`  Email: ${testAccount.user}`);
    console.log(`  Password: ${testAccount.pass}`);
    console.log(`  View emails at: https://ethereal.email/login`);

    return transporter;
}

module.exports.sendOtpEmail = async (email, otp) => {
    const transport = await getTransporter();

    const info = await transport.sendMail({
        from: '"RideNepal" <noreply@ridenepal.com>',
        to: email,
        subject: `Your RideNepal OTP: ${otp}`,
        text: `Your OTP verification code is: ${otp}\n\nThis code expires in 5 minutes.\n\nDo not share this code with anyone.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #000; text-align: center;">RideNepal</h2>
                <div style="background: #f5f5f5; border-radius: 12px; padding: 30px; text-align: center;">
                    <p style="color: #666; margin-bottom: 10px;">Your verification code is:</p>
                    <h1 style="color: #000; font-size: 36px; letter-spacing: 8px; margin: 20px 0;">${otp}</h1>
                    <p style="color: #999; font-size: 14px;">This code expires in 5 minutes</p>
                </div>
                <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
                    Do not share this code with anyone.
                </p>
            </div>
        `,
    });

    // Get the Ethereal preview URL to view the email
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`OTP Email sent to ${email} | OTP: ${otp}`);
    console.log(`Preview URL: ${previewUrl}`);

    return previewUrl;
};
