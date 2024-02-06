const axios = require('axios');
const { faker } = require('@faker-js/faker');

// Define available endpoints
const endpoints = [
  'https://bin.cflab.one/get',
  'https://bin.cflab.one/post',
  'https://bin.cflab.one/put',
  'https://bin.cflab.one/delete',
  'https://bin.cflab.one/patch'
];

// Function to make a random request
async function makeRandomRequest() {
  const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const method = randomEndpoint.split('/').pop(); // Extracts method from URL
  const customUserAgent = faker.internet.userAgent(); // Generates a random User-Agent
  const binKey = faker.number.int({ min: 1000, max: 3000 }); // Generates a random ID for "bin-key"

  const config = {
    headers: {
      'User-Agent': customUserAgent,
      'bin-key': binKey
    }
  };

  try {
    let response;
    if (method === 'get' || method === 'delete') {
      response = await axios[method](randomEndpoint, config);
    } else {
      response = await axios[method](randomEndpoint, {
        data: `Sample ${method.toUpperCase()} data`
      }, config);
    }
  } catch (error) {
    console.error(`${method.toUpperCase()} Error:`, error);
  }
}

// Function to calculate the number of requests per second based on the current time
function calculateRequestsPerSecond() {
  const hour = new Date().getHours();
  if (hour >= 9 && hour < 17) { // Gradual increase from 9 AM to 3 PM, then decrease
    const rpsSchedule = {
      9: 2,
      10: 3,
      11: 4,
      12: 5,
      13: 6, // 1 PM
      14: 7, // 2 PM
      15: 6, // 3 PM
      16: 5, // 4 PM
      17: 4, // 5 PM
    };
    return rpsSchedule[hour] || 10; // Default to 10 if hour is not explicitly defined
  } else if (hour === 3) { // 6 PM
    return 2;
  } else {
    return 1; // 10 rps for all other times
  }
}

// Dynamic scheduler to adjust request rate
function scheduleNextRequest() {
  const requestsPerSecond = calculateRequestsPerSecond();
  const interval = 1000 / requestsPerSecond; // Calculate interval based on requests per second

  for (let i = 0; i < requestsPerSecond; i++) {
    makeRandomRequest();
  }

  setTimeout(scheduleNextRequest, interval);
}

// Start the process
scheduleNextRequest();