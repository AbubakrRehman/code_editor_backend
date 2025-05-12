const express = require('express');
const cors = require('cors');
const { executeFile, generateFile } = require('./utilities');

import { PrismaClient } from '@prisma/client'
const prismaClient = new PrismaClient()

const app = express();
const PORT = 3000;



// Enable CORS
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Middleware to parse JSON requests
app.use(express.json());


// Basic route
app.get('/job/:id', async (req, res) => {
    const jobId = req.params.id;

    try {
        let job = await prismaClient.job.findUnique({
            where: { id: jobId }
        })

        if (!job)
            return res.status(404).json({ message: "Job not found" });

        return res.json(job);

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post('/execute', async (req, res) => {
    console.log("req body", req.body);
    const { code, extension } = req.body;

    //create and write into file
    try {
        let filePath = await generateFile(code, extension);
        let job = await prismaClient.job.create({ data: {} })
        res.json({ jobId: job.id });

        let output = await executeFile(filePath, extension)
        await prismaClient.job.update({
            where: { id: job.id },
            data: {
                output: output,
                status: "COMPLETED"
            }
        })

    } catch (error) {
        let resultantError = error.stderr ? error.stderr : error.error;
        resultantError = JSON.stringify(resultantError);
        if (!resultantError)
            return res.status(500).json({ message: "Internal Server Error" });


        await prismaClient.job.update({
            where: { id: job.id },
            data: {
                output: resultantError,
                status: "COMPLETED"
            }
        })
    }

});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});