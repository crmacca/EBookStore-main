const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Paths relative to the deploy.js script
const clientPath = path.join(__dirname, 'client'); // Path to the client directory
const serverPath = path.join(__dirname, 'server'); // Path to the server directory
const isProduction = true

function setupClientEnvironment() {
  // Define the content of the .env file for the React app
  const envContent = `REACT_APP_BACKEND_URL=https://ebook.cmcdev.net\n`; // Adjust backend URL as needed
  fs.writeFileSync(path.join(clientPath, '.env'), envContent, { encoding: 'utf-8' });
  console.log('.env file has been set up in the client directory.');
}

function setupServerEnvironment() {
    const envFilePath = path.join(serverPath, '.env');
    const envVarKey = 'NODE_ENV';
    const envVarValue = 'production';

    // Read existing content or initialize it if the file does not exist
    let envContent = '';
    try {
        envContent = fs.readFileSync(envFilePath, { encoding: 'utf-8' });
    } catch (err) {
        console.log('.env file does not exist, creating a new one.');
    }

    // Convert existing content into a key-value object
    const envVars = envContent.split('\n').reduce((acc, line) => {
        const [key, value] = line.split('=');
        if (key && value) {
            acc[key.trim()] = value.trim();
        }
        return acc;
    }, {});

    // Update or add the specific environment variable
    envVars[envVarKey] = envVarValue;

    // Convert the key-value object back into string format
    const newEnvContent = Object.keys(envVars)
                                .filter(key => envVars[key])
                                .map(key => `${key}=${envVars[key]}`)
                                .join('\n');

    // Write updated content back to the .env file
    fs.writeFileSync(envFilePath, newEnvContent, { encoding: 'utf-8' });
    console.log(`.env file has been updated with ${envVarKey}=${envVarValue} in the server directory.`);
}

function buildReactApp() {
  console.log('Building the React app...');
  execSync('npm install', { stdio: 'inherit', cwd: clientPath });
  execSync('npm run build', { stdio: 'inherit', cwd: clientPath });
  console.log('React app built successfully.');
}

function startServer() {
  console.log('Starting the server...');
  execSync('npm install', { stdio: 'inherit', cwd: serverPath });
  execSync('node index.js', { stdio: 'inherit', cwd: serverPath });
  console.log('Server is running.');
}

function main() {
  if (isProduction) {
    setupClientEnvironment();
    buildReactApp();
    setupServerEnvironment();
  }
  startServer();
}

main();
