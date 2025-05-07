import { startApolloServer } from '../../server/graphql';
import { createTestClient } from 'apollo-server-testing';
import mongoose from 'mongoose';
import Accounts from '../../server/models/accounts';
import logger from '../../server/graphql/utils/logger';
import express from "express";

jest.mock('../../server/graphql/utils/logger');

describe('Accounts Integration', () => {
  let testClient: any;
  const app = express();

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST!);
    const server = await startApolloServer(app);
    testClient = createTestClient(server);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Accounts.deleteMany({});
    jest.clearAllMocks();
  });

  it('should create and list accounts', async () => {
    // Mutación para crear cuenta
    const CREATE_ACCOUNT = `
      mutation CreateAccount($input: AccountInput!) {
        addAccount(input: $input) {
          _id
          name
          email
        }
      }
    `;

    const createResponse = await testClient.mutate({
      mutation: CREATE_ACCOUNT,
      variables: {
        input: {
          name: 'Test Account',
          email: 'test@example.com'
        }
      }
    });

    expect(createResponse.errors).toBeUndefined();
    expect(createResponse.data?.addAccount).toHaveProperty('_id');

    // Query para listar cuentas
    const LIST_ACCOUNTS = `
      query ListAccounts {
        listAccounts {
          accounts {
            _id
            name
          }
          total
        }
      }
    `;

    const listResponse = await testClient.query({
      query: LIST_ACCOUNTS
    });

    expect(listResponse.errors).toBeUndefined();
    expect(listResponse.data?.listAccounts.accounts.length).toBe(1);
    expect(listResponse.data?.listAccounts.total).toBe(1);
  });
});