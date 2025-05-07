import { queries } from '../../../server/graphql/products/queries';
import Products from '../../../server/models/products';
import logger from '../../../server/graphql/utils/logger';

jest.mock('../../../server/models/products');
jest.mock('../../../server/graphql/utils/logger');

const mockProduct = Products as jest.Mocked<typeof Products>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('Product Queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listProducts', () => {
    it('should return paginated products', async () => {
      const mockProducts = [{
        _id: '1',
        name: 'Product 1',
        sku: 'SKU001',
        accountId: 'acc1'
      }];

      mockProduct.aggregate.mockResolvedValueOnce([{ total: 1 }]) // count
        .mockResolvedValueOnce(mockProducts); // data

      const result = await queries.listProducts({}, {
        page: 1,
        pageSize: 10
      });

      expect(result.products).toEqual(mockProducts);
      expect(result.total).toBe(1);
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });
});