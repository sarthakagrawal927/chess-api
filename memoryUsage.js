const process = require('process');

// Function to convert bytes to human-readable format
function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let index = 0;
  while (bytes >= 1024 && index < units.length - 1) {
    bytes /= 1024;
    index++;
  }
  return `${bytes.toFixed(2)} ${units[index]}`;
}

// Get CPU usage of the Node.js process
function getCpuUsage() {
  const cpuUsage = process.cpuUsage();
  const elapsedTime = process.uptime() * 1000; // Elapsed time in milliseconds

  const userCpuUsage = cpuUsage.user / 1000; // User CPU time in milliseconds
  const systemCpuUsage = cpuUsage.system / 1000; // System CPU time in milliseconds
  const totalCpuUsage = userCpuUsage + systemCpuUsage; // Total CPU usage in milliseconds

  const cpuPercentage = ((totalCpuUsage / elapsedTime) * 100).toFixed(2); // CPU usage percentage

  return {
    userCpuUsage: userCpuUsage.toFixed(2), // User CPU time in milliseconds
    systemCpuUsage: systemCpuUsage.toFixed(2), // System CPU time in milliseconds
    cpuPercentage: `${cpuPercentage}%` // CPU usage percentage
  };
}

// Get memory usage of the Node.js process
function getMemoryUsage() {
  const memoryUsage = process.memoryUsage();

  return {
    rss: formatBytes(memoryUsage.rss), // Resident Set Size (total memory allocated for the process)
    heapTotal: formatBytes(memoryUsage.heapTotal), // Total size of the heap
    heapUsed: formatBytes(memoryUsage.heapUsed), // Used heap size
    external: formatBytes(memoryUsage.external) // Memory used by C++ objects bound to JavaScript objects
  };
}

// Usage example

function printMemoryUsage(){
  const cpuUsage = getCpuUsage();
  const memoryUsage = getMemoryUsage();

  console.log('CPU Usage:');
  console.log(`User CPU Time: ${cpuUsage.userCpuUsage} ms`);
  console.log(`System CPU Time: ${cpuUsage.systemCpuUsage} ms`);
  console.log(`CPU Percentage: ${cpuUsage.cpuPercentage}`);

  console.log('\nMemory Usage:');
  console.log(`Resident Set Size (RSS): ${memoryUsage.rss}`);
  console.log(`Heap Total: ${memoryUsage.heapTotal}`);
  console.log(`Heap Used: ${memoryUsage.heapUsed}`);
  console.log(`External Memory: ${memoryUsage.external}`);
}

module.exports = { printMemoryUsage };
