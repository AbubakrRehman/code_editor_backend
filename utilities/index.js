const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { exec } = require('child_process');

const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient()


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

            if (stdout) {
                resolve(stdout);
                return
            }

            if (stderr) {
                resolve(stderr);
                return
            }

            if (error) {
                reject({ message: "Execution failed", errorCode: 1001 });
                return
            }
          
        });
    });
}



async function startDB() {
    try {
      await prisma.$connect();
      console.log('✅ Connected to database');
  
      // Start your app here (e.g., Express)
      // app.listen(3000, () => console.log('Server running'));
    } catch (err) {
      console.error('❌ Failed to connect to the database:', err);
      process.exit(1); // Exit with failure
    }
}

module.exports = { executeFile, generateFile, startDB };