import mongoose from 'mongoose';

import { app } from './app';

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('no secret key provided in env file.');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('connected to mongodb');
  } catch (err) {
    console.log(err);
  }

  app.listen(3000, () => {
    console.log('Auth service listening on port 3001!!!');
  });
};

start();
