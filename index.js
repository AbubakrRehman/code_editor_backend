const express = require('express');
const cors = require('cors');
const { executeFile, generateFile, startDB } = require('./utilities');

const { PrismaClient } = require('./generated/prisma')
const prisma = new PrismaClient()

startDB();

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

    let job;

    try {
        let filePath = await generateFile(code, extension);
        job = await prisma.job.create({ data: {} });
        res.json(job);

        let output = await executeFile(filePath, extension)
        await prisma.job.update({
            where: { id: job.id },
            data: {
                output: output,
                status: "COMPLETED"
            }
        })

    } catch (error) {
        console.log("error", error)
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

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});