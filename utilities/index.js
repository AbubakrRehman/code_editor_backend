const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { exec } = require('child_process');


const dirCodes = path.join(__dirname, '../codes');
// if (!fs.exists(dirCodes)) {
//     fs.mkdirSync(dirCodes, { recursive: true })
// }



async function generateFile(content, extension) {
    const jobId = uuidv4();
    const fileName = `${jobId}.${extension}`
    const filePath = path.join(dirCodes, fileName);
    await fs.writeFile(filePath, content, 'utf8');
    return filePath;
}

function executeFile(filePath, extension) {
    return new Promise((resolve, reject) => {
        
        exec(`node ${filePath}`, (error, stdout, stderr) => {
            if (error) {
                reject({ error: error.message, stderr });
            } else if (stderr) {
                reject({ stderr });
            } else {
                resolve(stdout);
            }
        });
    });
}

module.exports = { executeFile, generateFile };