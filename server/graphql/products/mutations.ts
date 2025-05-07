import Accounts from "../../models/accounts";
import Products from "../../models/products";
import { generateMockProducts } from "./mocks/products.mock";

export const mutations = {
  addProducts: async (_: any, args: { products: Array<{ name: string; sku: string; accountId: string }> }) => {
    try {
      const { products } = args;

      // Verificar que la cuenta exista
      const accountIds = [...new Set(products.map(p => p.accountId))];
      const accounts = await Accounts.find({ _id: { $in: accountIds } });
      
      if (accounts.length !== accountIds.length) {
        throw new Error('One or more accountIds are invalid');
      }

      // Verificar SKUs únicos
      const skus = products.map(p => p.sku);
      const existingProducts = await Products.find({ sku: { $in: skus } });
      
      if (existingProducts.length > 0) {
        throw new Error(`Some SKUs already exist: ${existingProducts.map(p => p.sku).join(', ')}`);
      }

      // Insertar productos
      const createdProducts = await Products.insertMany(products);
      return createdProducts;
    } catch (error) {
      console.error('Error adding products:', error);
      throw error instanceof Error ? error : new Error('Failed to add products');
    }
  },

  mockCreateProducts: async (_: any, args: { count?: number, accountId: string }) => {
    try {
      const { count = 5, accountId } = args;
      
      const accountExists = await Accounts.exists({ _id: accountId });
      if (!accountExists) {
        throw new Error('Account does not exist');
      }

      const mockData = generateMockProducts(count, accountId);
      return await Products.insertMany(mockData);
    } catch (error) {
      console.error('Error creating mock products:', error);
      throw new Error('Failed to create mock products');
    }
  }
};
