const express = require('express');
const cors = require('cors');
const { executeFile, generateFile } = require('./utilities');

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
app.get('/', (req, res) => {
    res.send('Welcome to the Express server!');
});

app.post('/execute', async (req, res) => {
    console.log("req body", req.body);
    const { code, extension } = req.body;

    //create and write into file
    try {
        let filePath = await generateFile(code, extension);
        let output = await executeFile(filePath, extension)
        res.json({ output });
    } catch (error) {
        res.json({ output: (error.stderr ? error.stderr : error.error) });
    }

});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});