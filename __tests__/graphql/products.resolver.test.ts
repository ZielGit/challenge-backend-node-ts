import { startApolloServer } from '../../server/graphql';
import { createTestClient } from 'apollo-server-testing';
import mongoose from 'mongoose';
import Product from '../../server/models/products';
import Accounts from '../../server/models/accounts';
import logger from '../../server/graphql/utils/logger';
import express from "express";

// Mock del logger
jest.mock('../../server/graphql/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  child: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn()
  }))
}));

const mockLogger = logger as jest.Mocked<typeof logger>;
const app = express();

describe('Product Resolvers', () => {
  let testClient: any;
  let testAccount: any;
  let testProduct: any;

  beforeAll(async () => {
    // Configuración de la base de datos de prueba
    await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/test_db');

    // Limpiar colecciones
    await Accounts.deleteMany({});
    await Product.deleteMany({});

    // Crear datos de prueba
    testAccount = await Accounts.create({
      name: 'Test Account',
      email: 'test@example.com'
    });

    testProduct = await Product.create({
      name: 'Test Product',
      sku: 'SKU001',
      accountId: testAccount._id
    });

    // Iniciar servidor Apollo
    const server = await startApolloServer(app);
    testClient = createTestClient(server);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Mutations', () => {
    it('should add multiple products', async () => {
      const ADD_PRODUCTS = `
        mutation AddProducts($products: [ProductInput!]!) {
          addProducts(products: $products) {
            _id
            name
            sku
            accountId
          }
        }
      `;

      const { data, errors } = await testClient.mutate({
        mutation: ADD_PRODUCTS,
        variables: {
          products: [
            {
              name: 'New Product 1',
              sku: 'SKU002',
              accountId: testAccount._id.toString()
            },
            {
              name: 'New Product 2',
              sku: 'SKU003',
              accountId: testAccount._id.toString()
            }
          ]
        }
      });

      expect(errors).toBeUndefined();
      expect(data?.addProducts.length).toBe(2);
      expect(data?.addProducts[0].name).toBe('New Product 1');
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should fail when adding products with invalid account', async () => {
      const ADD_PRODUCTS = `
        mutation AddProducts($products: [ProductInput!]!) {
          addProducts(products: $products) {
            _id
          }
        }
      `;

      const invalidAccountId = new mongoose.Types.ObjectId();
      const { errors } = await testClient.mutate({
        mutation: ADD_PRODUCTS,
        variables: {
          products: [
            {
              name: 'Invalid Product',
              sku: 'SKU004',
              accountId: invalidAccountId.toString()
            }
          ]
        }
      });

      expect(errors).toBeDefined();
      expect(errors[0].message).toContain('One or more accountIds are invalid');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('Queries', () => {
    it('should list products with account details', async () => {
      const LIST_PRODUCTS = `
        query ListProducts {
          listProducts {
            products {
              _id
              name
              account {
                _id
                name
              }
            }
            total
          }
        }
      `;

      const { data, errors } = await testClient.query({
        query: LIST_PRODUCTS
      });

      expect(errors).toBeUndefined();
      expect(data?.listProducts.products.length).toBeGreaterThan(0);
      expect(data?.listProducts.products[0].account.name).toBe('Test Account');
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should filter products by search term', async () => {
      const SEARCH_PRODUCTS = `
        query SearchProducts($search: String) {
          listProducts(search: $search) {
            products {
              name
            }
          }
        }
      `;

      const { data } = await testClient.query({
        query: SEARCH_PRODUCTS,
        variables: {
          search: 'Test'
        }
      });

      expect(data?.listProducts.products.some((p: any) => p.name === 'Test Product')).toBe(true);
    });

    it('should filter products by accountId', async () => {
      const FILTER_PRODUCTS = `
        query FilterProducts($accountId: String) {
          listProducts(accountId: $accountId) {
            products {
              name
            }
            total
          }
        }
      `;

      const { data } = await testClient.query({
        query: FILTER_PRODUCTS,
        variables: {
          accountId: testAccount._id.toString()
        }
      });

      expect(data?.listProducts.total).toBeGreaterThan(0);
      expect(data?.listProducts.products[0].name).toBe('Test Product');
    });
  });

  describe('Product-Account Relationship', () => {
    it('should return null for account when not found', async () => {
      // Crear producto con cuenta que no existe
      const orphanProduct = await Product.create({
        name: 'Orphan Product',
        sku: 'ORPHAN001',
        accountId: new mongoose.Types.ObjectId()
      });

      const GET_PRODUCT = `
        query GetProduct {
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

      const { data } = await testClient.query({
        query: GET_PRODUCT
      });

      const orphanInResponse = data?.listProducts.products.find(
        (p: any) => p.name === 'Orphan Product'
      );
      expect(orphanInResponse.account).toBeNull();
    });
  });
});