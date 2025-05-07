import { IAccount } from "../../../interfaces/account";

export const mockAccounts: IAccount[] = [
  {
    name: "Test Account name 1",
    email: "test_1@example.com"
  },
  {
    name: "Test Account name 2",
    email: "test_2@example.com"
  }
];

export const generateMockAccounts = (count: number): IAccount[] => {
  return Array.from({ length: count }, (_, i) => ({
    name: `Mock Account ${i + 1}`,
    email: `mock${i + 1}@example.com`
  }));
};
