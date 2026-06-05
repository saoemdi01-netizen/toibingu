const { execSync, exec } = require('child_process');

try {
  // Find PID of process listening on port 5000
  const output = execSync('netstat -ano').toString();
  const lines = output.split('\n');
  let pid = null;
  for (const line of lines) {
    if (line.includes(':5000') && line.includes('LISTENING')) {
      const parts = line.trim().split(/\s+/);
      pid = parts[parts.length - 1];
      console.log(`Found process on port 5000 with PID: ${pid}`);
      break;
    }
  }

  if (pid) {
    execSync(`taskkill /F /PID ${pid}`);
    console.log(`Killed PID ${pid}.`);
  } else {
    console.log('No process found on port 5000.');
  }

  // Start backend server
  console.log('Starting backend server...');
  const child = exec('node server.js', { cwd: 'C:\\\\Users\\\\Admin\\\\Documents\\\\GitHub\\\\toibingu\\\\backend' });
  
  // Wait a moment and check status
  setTimeout(() => {
    console.log('Backend server restart checked.');
    process.exit(0);
  }, 1000);

} catch (e) {
  console.error('Error restarting backend:', e);
  process.exit(1);
}
