import { IProduct } from "../../../interfaces/product";

export const mockProducts: IProduct[] = [
  {
    name: "Test Product name 1",
    sku: "SKU001",
    accountId: "000000000000000000000001"
  },
  {
    name: "Test Product name 2",
    sku: "SKU002",
    accountId: "000000000000000000000002"
  }
];

export const generateMockProducts = (count: number, accountId: string): IProduct[] => {
  return Array.from({ length: count }, (_, i) => ({
    name: `Mock Product ${i + 1}`,
    sku: `MOCK${i + 1}`,
    accountId
  }));
};
