import { mutations } from '../../../server/graphql/products/mutations';
import Products from '../../../server/models/products';
import Accounts from '../../../server/models/accounts';
import logger from '../../../server/graphql/utils/logger';
import { Types } from 'mongoose';

jest.mock('../../../server/models/products');
jest.mock('../../../server/models/accounts');
jest.mock('../../../server/graphql/utils/logger');

const mockProduct = {
  insertMany: jest.fn(),
  find: jest.fn(),
};
const mockAccounts = Accounts as jest.Mocked<typeof Accounts>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('Product Mutations', () => {
  const mockAccountId = new Types.ObjectId().toString();
  const mockProductData = {
    _id: new Types.ObjectId().toString(),
    name: 'Test Product',
    sku: 'SKU001',
    accountId: mockAccountId.toString(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addProducts', () => {
    it('should create multiple products successfully', async () => {
      const productsInput = [
        { name: 'Product 1', sku: 'SKU001', accountId: mockAccountId.toString() },
        { name: 'Product 2', sku: 'SKU002', accountId: mockAccountId.toString() }
      ];

      mockAccounts.countDocuments.mockResolvedValue(1);
      mockProduct.insertMany.mockResolvedValue([
        { ...mockProductData, _id: new Types.ObjectId(), sku: 'SKU001' },
        { ...mockProductData, _id: new Types.ObjectId(), sku: 'SKU002' }
      ]);

      const result = await mutations.addProducts({}, {
        products: productsInput
      });

      expect(result.length).toBe(2);
      expect(mockProduct.insertMany).toHaveBeenCalledWith(productsInput);
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should validate account exists', async () => {
      const productsInput = [
        { name: 'Product 1', sku: 'SKU001', accountId: mockAccountId.toString() }
      ];

      mockAccounts.countDocuments.mockResolvedValue(0);

      await expect(mutations.addProducts({}, {
        products: productsInput
      })).rejects.toThrow('One or more accountIds are invalid');
    });

    it('should validate duplicate SKUs', async () => {
      const productsInput = [
        { name: 'Product 1', sku: 'SKU001', accountId: mockAccountId.toString() }
      ];

      mockAccounts.countDocuments.mockResolvedValue(1);
      mockProduct.find.mockResolvedValue([{ sku: 'SKU001' }]);

      await expect(mutations.addProducts({}, {
        products: productsInput
      })).rejects.toThrow('Some SKUs already exist');
    });

    it('should handle database errors', async () => {
      const productsInput = [
        { name: 'Product 1', sku: 'SKU001', accountId: mockAccountId.toString() }
      ];

      mockAccounts.countDocuments.mockResolvedValue(1);
      mockProduct.insertMany.mockRejectedValue(new Error('DB Error'));

      await expect(mutations.addProducts({}, {
        products: productsInput
      })).rejects.toThrow('Failed to add products');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});