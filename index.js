const express = require('express');
const cors = require('cors');
const { executeFile, generateFile, startDB, removeFile } = require('./utilities');

// import { PrismaClient } from "@prisma/client";
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient()

// startDB();

const app = express();
const PORT = 8091;

// Enable CORS
app.use(cors({
    origin: "*", // Set your allowed origin here
    credentials: true
}));

// Middleware to parse JSON requests
app.use(express.json());


// Basic route
app.get('/job/:id', async (req, res) => {
    const jobId = +req.params.id;

    try {
        let job = await prisma.job.findUnique({
            where: { id: jobId }
        })

        if (!job)
            return res.status(404).json({ message: "Job not found" });

        return res.json(job);

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", errorCode: 1003 });
    }
});

app.post('/execute', async (req, res) => {
    const { code, extension } = req.body;

    if (!code || !extension)
        return res.status(400).json({ message: "Code and extension are required" });

    if (!['java', 'js', 'cpp', 'c', 'py'].includes(extension))
        return res.status(400).json({ message: "Extension is not supported" });

    let job;

    try {
        let { filePath, fileName } = await generateFile(code, extension);
        job = await prisma.job.create({ data: {} });
        res.json(job);

        let output = await executeFile(fileName, extension);
        await removeFile(fileName, extension);
        await prisma.job.update({
            where: { id: job.id },
            data: {
                output: output,
                status: "COMPLETED"
            }
        })
    } catch (error) {
        if (error.errorCode === 1001) {
            await prisma.job.update({
                where: { id: job.id },
                data: {
                    output: error.message,
                    status: "FAILED"
                }
            })
        } else {
            return res.status(500).json({ message: "Internal Server Error", errorCode: 1002 });
        }
    }

});


// Start server only if DB connects successfully
async function startServer() {
    try {
        // Attempt DB connection
        await prisma.$connect();
        console.log('✅ Database connected successfully.');

        // Start Express server
        app.listen(PORT, () => {
            console.log(`🚀 Server is running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('❌ Failed to connect to the database:', err);
        process.exit(1); // Exit the process with failure
    }
}

// Start the app
startServer();

// Optional: Graceful shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    console.log('\n🛑 Server stopped. Prisma disconnected.');
    process.exit(0);
});

