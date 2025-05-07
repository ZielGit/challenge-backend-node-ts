import { startApolloServer } from '../../server/graphql';
import { createTestClient } from 'apollo-server-testing';
import mongoose from 'mongoose';
import Accounts from '../../server/models/accounts';
import Products from '../../server/models/products';
import express from "express";

describe('Products Integration', () => {
  let testClient: any;
  let testAccount: any;
  const app = express();

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST!);
    const server = await startApolloServer(app);
    testClient = createTestClient(server);

    // Crear una cuenta de prueba
    testAccount = await Accounts.create({
      name: 'Test Account',
      email: 'test@example.com'
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Products.deleteMany({});
  });

  it('should create and list products with account', async () => {
    const CREATE_PRODUCT = `
      mutation CreateProduct($input: ProductInput!) {
        addProduct(input: $input) {
          _id
          name
          account {
            name
          }
        }
      }
    `;

    const createResponse = await testClient.mutate({
      mutation: CREATE_PRODUCT,
      variables: {
        input: {
          name: 'Test Product',
          sku: 'SKU001',
          accountId: testAccount._id.toString()
        }
      }
    });

    expect(createResponse.errors).toBeUndefined();
    expect(createResponse.data?.addProduct.account.name).toBe('Test Account');

    const LIST_PRODUCTS = `
      query ListProducts {
        listProducts {
          products {
            name
            account {
              name
            }
          }
        }
      }
    `;

    const listResponse = await testClient.query({
      query: LIST_PRODUCTS
    });

    expect(listResponse.data?.listProducts.products[0].account.name).toBe('Test Account');
  });
});