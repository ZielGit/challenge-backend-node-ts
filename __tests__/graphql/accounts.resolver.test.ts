import { startApolloServer } from '../../server/graphql';
import { createTestClient } from 'apollo-server-testing';
import mongoose from 'mongoose';
import logger from '../../server/graphql/utils/logger';
import express from "express";

jest.mock('../../server/graphql/utils/logger');

describe('Accounts Resolver', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  const app = express();

  it('should create an account', async () => {
    const server = await startApolloServer(app);
    const { mutate } = createTestClient(server);

    const CREATE_ACCOUNT = `
      mutation CreateAccount($input: AccountInput!) {
        addAccount(input: $input) {
          _id
          name
          email
        }
      }
    `;

    const { data, errors } = await mutate({
      mutation: CREATE_ACCOUNT,
      variables: {
        input: {
          name: 'Test Account',
          email: 'test@example.com',
        },
      },
    });

    expect(errors).toBeUndefined();
    expect(data?.addAccount).toHaveProperty('_id');
    expect(data?.addAccount.name).toBe('Test Account');
    expect(logger.info).toHaveBeenCalled();
  });
});