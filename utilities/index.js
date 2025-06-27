const fs = require('fs');
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
    const javaJobId = jobId.replaceAll("-","_");
    const fileName = extension === 'java' ? `Main_${javaJobId}.${extension}` : `${jobId}.${extension}`
    const filePath = path.join(dirCodes, fileName);
    let fileContent = extension === 'java' ? content.replace("Main", `Main_${javaJobId}`) : content;
    // await fs.writeFile(filePath, content, 'utf8');

    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, fileContent, 'utf8', (err) => {
            if (err) {
                console.error(`Error writing file: ${err.message}`);
            } else {
                console.log(`File written successfully to ${filePath}`);
                resolve({ filePath, fileName: extension === "java" ? `Main_${javaJobId}` : jobId });
            }
        });
    })

    // return filePath;
}

function executeJs(fileName, extension) {
    const fullFileName = `${fileName}.${extension}`
    const filePath = path.join(dirCodes, fullFileName);
    return new Promise((resolve, reject) => {
        exec(`node "${filePath}"`, (error, stdout, stderr) => {
            if (error) {
                reject({ message: "Execution failed", errorCode: 1001 });
                return;
            }
            resolve(stdout || stderr);
        });
    });

}


function executePy(fileName, extension) {
    const fullFileName = `${fileName}.${extension}`
    const filePath = path.join(dirCodes, fullFileName);
    return new Promise((resolve, reject) => {
        exec(`python3 "${filePath}"`, (error, stdout, stderr) => {
            if (error) {
                reject({ message: "Execution failed", errorCode: 1001 });
                return;
            }
            resolve(stdout || stderr);
        });
    });

}

function executeCpp(fileName, extension) {
    const fullFileName = `${fileName}.${extension}`
    const filePath = path.join(dirCodes, fullFileName);
    return new Promise((resolve, reject) => {
        exec(`g++ ${filePath} -o ./codes/${fileName} && ./codes/${fileName}`, (error, stdout, stderr) => {
            if (error) {
                reject({ message: "Execution failed", errorCode: 1001 });
                return;
            }
            resolve(stdout || stderr);
        });
    });
}

function executeC(fileName, extension) {
    const fullFileName = `${fileName}.${extension}`
    const filePath = path.join(dirCodes, fullFileName);
    return new Promise((resolve, reject) => {
        exec(`gcc ${filePath} -o ./codes/${fileName} && ./codes/${fileName}`, (error, stdout, stderr) => {
            if (error) {
                reject({ message: "Execution failed", errorCode: 1001 });
                return;
            }
            resolve(stdout || stderr);
        });
    });
}

function executeJava(fileName, extension) {
    const fullFileName = `${fileName}.${extension}`
    const filePath = path.join(dirCodes, fullFileName);
    return new Promise((resolve, reject) => {
        exec(`javac ${filePath} && java ${fileName}`, { cwd: dirCodes }, (error, stdout, stderr) => {
            if (error) {
                reject({ message: "Execution failed", errorCode: 1001 });
                return;
            }
            resolve(stdout || stderr);
        });
    });
}

function executeFile(fileName, extension) {
    switch (extension) {
        case "js": return executeJs(fileName, extension);

        case "py": return executePy(fileName, extension);

        case "cpp": return executeCpp(fileName, extension);

        case "c": return executeC(fileName, extension);

        case "java": return executeJava(fileName, extension);

        default:
            break;
    }
}


function removeFile(fileName, extension) {
    const fullFileName = `${fileName}.${extension}`;
    const fileNameWithoutExtension = fileName;
    const filePath = path.join(dirCodes, fullFileName);
    const classPath = path.join(dirCodes, `${fileName}.class`);
    const executablePath = path.join(dirCodes, fileNameWithoutExtension);
   
    switch (extension) {
        case "js": return deleteFile(filePath);

        case "py": return deleteFile(filePath);

        case "cpp": return Promise.all([deleteFile(filePath), deleteFile(executablePath)]);

        case "c": return Promise.all([deleteFile(filePath), deleteFile(executablePath)]);

        case "java": return Promise.all([deleteFile(filePath), deleteFile(classPath)]); 

        default:
            break;
    }

}


function deleteFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                reject({ message: "File deletion failed", error: err });
            } else {
                resolve({ message: "File deleted successfully" });
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

module.exports = { executeFile, removeFile, generateFile, startDB };