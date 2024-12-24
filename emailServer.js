const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { Verification } = require('./models/verification');
const app = express();
const PORT = 22221;
const options = {
    cert: fs.readFileSync(
        '/etc/letsencrypt/live/aspirewithalina.com/fullchain.pem'
    ),
    key: fs.readFileSync(
        '/etc/letsencrypt/live/aspirewithalina.com/privkey.pem'
    ),
};
const corsOptions = {
    origin: 'https://aspirewithalina.com',
    methods: ['POST'],
    allowedHeaders: ['Content-Type'],
};

const sesClient = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

app.use(cors(corsOptions));
app.use(bodyParser.json());

async function sendEmail(toAddress, subject, body) {
    const params = {
        Destination: {
            ToAddresses: [toAddress],
        },
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: body,
                },
            },
            Subject: {
                Charset: 'UTF-8',
                Data: subject,
            },
        },
        Source: 'no-reply@aspirewithalina.com',
    };

    try {
        const command = new SendEmailCommand(params);
        const response = await sesClient.send(command);
        console.log('Email sent successfully:', response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

async function saveVerificationToken(email, token) {
    try {
        const verification = new Verification({
            email: email,
            token: token,
            isVerified: false,
            registrationCode: '',
            isRegistered: false,
        });
        await verification.save();
    } catch (error) {
        console.error('Error saving verification token:', error);
    }
}

function generateVerificationLink(token) {
    return `https://aspirewithalina.com/verify-email?token=${token}`; // Example verification URL
}

async function sendVerificationEmail(userEmail, token) {
    const verificationLink = generateVerificationLink(token);
    const subject = 'Verify Your Email Address';
    const body = `<h2>Welcome to Aspire With Alina!</h2>
                <hr/>
                <p>Please verify your email address by clicking the link below:</p>
                <a href="${verificationLink}"><strong>Verify Email</strong></a>`;

    await sendEmail(userEmail, subject, body);
}

// studentEmails: string[], subject: string, body: string
async function sendBulkEmails(studentEmails, subject, body) {
    for (const email of studentEmails) {
        await sendEmail(email, subject, body);
    }
}

// studentEmails: string[], classDetails: string
async function sendClassReminder(studentEmails, classDetails) {
    const subject = 'Upcoming Class Reminder';
    const body = `<p>Don’t forget about your upcoming class!</p>
                <p>${classDetails}</p>`;

    await sendBulkEmails(studentEmails, subject, body);
}

app.post('/send-verification-email', async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Sending verification email to:', email);
        const token = uuidv4();
        console.log('Verification token:', token);
        await saveVerificationToken(email, token);
        await sendVerificationEmail(email, token);
        res.status(200).send('Verification email sent successfully');
    } catch (error) {
        console.error(`Error sending verification email: ${error}`);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;
        console.log('Verifying email with token:', token);
        const verification = await Verification.findOne({ token: token });
        verification.isVerified = true;
        const registrationCode = uuidv4();
        verification.registrationCode = registrationCode;
        verification.isRegistered = false;
        await verification.save();
        sendEmail(
            verification.email,
            'Registration Code',
            `<h1>Welcome to Aspire With Alina!</h1>
            <h2>Your registration code is:</h2>
            <hr/>
            <strong>${registrationCode}</strong>
            <br/>
            <br/>
            <p>Use the registration code above to register with the app, and it'll take to you to the student info form.</p>
            <p>Once you're there, please fill out the information and then use your email address and the password you created to log in and use the app.</p>
            <br/>
            <br/>
            <p>Thank you for joining Aspire With Alina!</p>
            <br/>
            <p>Sincerely,</p>
            <br/>
            <p>Alina and the Aspire With Alina team</p>`
        );
        res.status(200).json({ registrationCode });
    } catch (error) {
        console.error(`Error verifying email: ${error}`);
        res.status(500).send('Internal Server Error');
    }
});

https.createServer(options, app).listen(PORT, () => {
    console.log(
        `Email Server is running securely on https://aspirewithalina.com:${PORT}`
    );
});

// app.listen(PORT, () => {
//     console.log(`Email server is running on port ${PORT}`);
// });
