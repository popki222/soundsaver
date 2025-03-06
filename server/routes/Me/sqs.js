require('dotenv').config();
const express = require("express")
const axios = require('axios')
const router = express.Router()
const { SendMessageCommand, SQSClient } = require('@aws-sdk/client-sqs');

const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;
const client = new SQSClient({
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

router.post('/', async (req, res) => {
    try {
        const { id, url } = req.body;
        console.log(JSON.stringify({ id, url }));
        
        if (!id || !url) {
            return res.status(400).json({ error: "Missing 'id' or 'url' in request body" });
        }

        const command = new SendMessageCommand({
            
            QueueUrl: SQS_QUEUE_URL,
            DelaySeconds: 10,
            MessageAttributes: {
                ID: {
                    DataType: "String",
                    StringValue: id.toString(),
                },
                URL: {
                    DataType: "String",
                    StringValue: url,
                },
            },
            MessageBody: JSON.stringify({ id, url }),
        });

        const response = await client.send(command);
        console.log("Message sent to SQS:", response);

        res.status(200).json({ message: "Message sent successfully", response });
    } catch (error) {
        console.error("Error sending message to SQS:", error);
        res.status(500).json({ error: "Failed to send message to SQS" });
    }
});

module.exports = router;