const mongoose = require('mongoose');
const Schedule = require('./models/schedule');
const connectDB = require('./config/db');

async function test() {
  await connectDB();
  const schedules = await Schedule.find();
  console.log('Total schedules:', schedules.length);
  if (schedules.length > 0) {
    console.log('First schedule sample:', JSON.stringify(schedules[0], null, 2));
  }
  process.exit(0);
}

test();
