import { queries } from '../../../server/graphql/accounts/queries';
import Accounts from '../../../server/models/accounts';
import logger from '../../../server/graphql/utils/logger';
import { Types } from 'mongoose';

jest.mock('../../../server/models/accounts');
jest.mock('../../../server/graphql/utils/logger');

const mockAccounts = Accounts as jest.Mocked<typeof Accounts>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('Account Queries', () => {
  const mockAccountData = {
    _id: new Types.ObjectId(),
    name: 'Test Account',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listAccounts', () => {
    it('should return paginated accounts without search', async () => {
      mockAccounts.aggregate.mockResolvedValueOnce([{ total: 1 }]) // count
        .mockResolvedValueOnce([mockAccountData]); // data

      const result = await queries.listAccounts({}, {
        page: 1,
        pageSize: 10
      });

      expect(result).toEqual({
        accounts: [mockAccountData],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1
      });
      expect(mockAccounts.aggregate).toHaveBeenCalledTimes(2);
    });

    it('should filter accounts by search term', async () => {
      mockAccounts.aggregate.mockResolvedValueOnce([{ total: 1 }])
        .mockResolvedValueOnce([mockAccountData]);

      const result = await queries.listAccounts({}, {
        page: 1,
        pageSize: 10,
        search: 'test'
      });

      expect(result.accounts.length).toBe(1);
      expect(mockAccounts.aggregate).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          $match: expect.objectContaining({
            $or: expect.arrayContaining([
              { name: expect.any(Object) },
              { email: expect.any(Object) }
            ])
          })
        })
      ]));
    });

    it('should handle empty results', async () => {
      mockAccounts.aggregate.mockResolvedValueOnce([]) // count
        .mockResolvedValueOnce([]); // data

      const result = await queries.listAccounts({}, {
        page: 1,
        pageSize: 10
      });

      expect(result).toEqual({
        accounts: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0
      });
    });

    it('should log errors', async () => {
      mockAccounts.aggregate.mockRejectedValueOnce(new Error('DB Error'));

      await expect(queries.listAccounts({}, {}))
        .rejects.toThrow('Error fetching accounts list');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});