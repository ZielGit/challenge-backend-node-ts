import Accounts from "../../models/accounts";
import { generateMockAccounts } from "./mocks/accounts.mock";

export const mutations = {
  testAccM: async (_: any) => {
    return true;
  },

  addAccount: async (_: any, args: { input: { name: string; email: string } }) => {
    try {
      const { name, email } = args.input;
      
      // Verificar si el email ya existe
      const existingAccount = await Accounts.findOne({ email });
      if (existingAccount) {
        throw new Error('El email ya está registrado');
      }

      const newAccount = new Accounts({
        name,
        email
      });

      await newAccount.save();
      return newAccount;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error instanceof Error ? error : new Error('Error al crear la cuenta');
    }
  },

  mockCreateAccounts: async (_: any, args: { count?: number }) => {
    try {
      const { count = 5 } = args;
      const mockData = generateMockAccounts(count);
      return await Accounts.insertMany(mockData);
    } catch (error) {
      console.error('Error creating mock accounts:', error);
      throw new Error('Failed to create mock accounts');
    }
  }
};
