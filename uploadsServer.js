const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const AWS = require('aws-sdk');
const app = express();
const PORT = 11115;
const options = {
    cert: fs.readFileSync(
        '/etc/letsencrypt/live/aspirewithalina.com/fullchain.pem'
    ),
    key: fs.readFileSync(
        '/etc/letsencrypt/live/aspirewithalina.com/privkey.pem'
    ),
};

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(bodyParser.json());

app.post('/chats/upload/image', upload.single('image'), async (req, res) => {
    try {
        const timestamp = Date.now();
        const originalImage = req.file.buffer;
        const thumbnail = await sharp(originalImage)
            .resize({ width: 300 })
            .toBuffer();
        const originalImageKey = `originals/${timestamp}-${req.file.originalname}`;
        await s3
            .upload({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: originalImageKey,
                Body: originalImage,
                ContentType: req.file.mimetype,
            })
            .promise();
        const thumbnailKey = `thumbnails/${timestamp}-${req.file.originalname}`;
        await s3
            .upload({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: thumbnailKey,
                Body: thumbnail,
                ContentType: req.file.mimetype,
            })
            .promise();

        res.status(200).json({
            image_url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${originalImageKey}`,
            thumbnail_url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${thumbnailKey}`,
        });
    } catch (error) {
        console.error(`Error uploading image: ${error}`);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/chats/upload/audio', upload.single('audio'), async (req, res) => {
    try {
        const audioKey = `audio/${Date.now()}-${req.file.originalname}`;
        console.log('audioKey', audioKey);

        const s3Result = await s3
            .upload({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: audioKey,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            })
            .promise();
        console.log('s3 result', s3Result);
        console.log(
            'audio url',
            `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${audioKey}`
        );

        res.status(200).json({
            audio_url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${audioKey}`,
        });
    } catch (error) {
        console.error(`Error uploading audio: ${error}`);
        res.status(500).send('Internal Server Error');
    }
});

https.createServer(options, app).listen(PORT, () => {
    console.log(
        `Server is running securely on https://aspirewithalina.com:${PORT}`
    );
});
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });
