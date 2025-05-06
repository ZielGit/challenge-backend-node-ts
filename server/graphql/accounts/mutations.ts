import Accounts from "../../models/accounts";

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
  }
};
