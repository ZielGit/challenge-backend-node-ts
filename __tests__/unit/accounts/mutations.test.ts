import { mutations } from '../../../server/graphql/accounts/mutations';
import Accounts from '../../../server/models/accounts';
import logger from '../../../server/graphql/utils/logger';

jest.mock('../../../server/models/accounts');
jest.mock('../../../server/graphql/utils/logger');

const mockAccounts = Accounts as jest.Mocked<typeof Accounts>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('Account Mutations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addAccount', () => {
    it('should create a new account successfully', async () => {
      const mockAccount = {
        _id: '123',
        name: 'Test',
        email: 'test@example.com',
        save: jest.fn().mockResolvedValue(true)
      };

      mockAccounts.findOne.mockResolvedValue(null);
      mockAccounts.prototype.save.mockResolvedValue(mockAccount);

      const result = await mutations.addAccount({}, {
        input: {
          name: 'Test',
          email: 'test@example.com'
        }
      });

      expect(result).toEqual(mockAccount);
      expect(mockAccounts.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should throw error if email exists', async () => {
      mockAccounts.findOne.mockResolvedValue({ email: 'exists@example.com' });

      await expect(
        mutations.addAccount({}, {
          input: {
            name: 'Test',
            email: 'exists@example.com'
          }
        })
      ).rejects.toThrow('Email already registered');
    });
  });
});