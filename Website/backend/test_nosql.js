import { loginAdmin } from './src/controllers/auth.controller.js';

// Mock mongoose User model
import User from './src/models/user.model.js';

// Mock request and response objects
const req = {
  body: {
    mallId: { "$ne": null }, // NoSQL injection payload
    password: "password123"
  }
};

const res = {
  statusCode: null,
  body: null,
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    this.body = data;
    console.log(`Status: ${this.statusCode}`);
    console.log(`Response: ${JSON.stringify(this.body)}`);
  }
};

// Override User.findOne to ensure it doesn't get called if validation works
const originalFindOne = User.findOne;
User.findOne = async () => {
    console.log("CRITICAL ERROR: Database query was executed! The vulnerability is still present.");
    return null;
};

async function test() {
    console.log("Running NoSQL Injection Test on loginAdmin...");
    await loginAdmin(req, res);

    if (res.statusCode === 400 && res.body.message === 'Invalid input format.') {
        console.log("✅ Test Passed: Injection payload rejected.");
    } else {
        console.log("❌ Test Failed: Invalid response.");
    }
}

test().catch(console.error);