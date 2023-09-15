import { response } from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { app } from '../app';

declare global {
  var signin: () => string[];
}

jest.mock('./../nats-wrapper.ts');

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'asdfasdf';
  const mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signin = () => {
  //build a JWT payload. {id, email}
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
  };
  // create a JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build session Object. { jwt: MY_JWY }
  const session = { jwt: token };

  // turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode to base 64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // return a string thats the cookie with encoded data
  return [`session=${base64}`];
};
