import Accounts from "../../models/accounts";

export const queries = {
  testAccQ: async (_: any) => {
    const accounts = await Accounts.find({});
    return accounts.length;
  },

  listAccounts: async (
    _: any,
    args: {
      page?: number;
      pageSize?: number;
      search?: string;
    }
  ) => {
    try {
      const { page = 1, pageSize = 10, search = '' } = args;
      const skip = (page - 1) * pageSize;

      const pipeline: any[] = [];

      // Filtrado
      if (search) {
        pipeline.push({
          $match: {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } }
            ]
          }
        });
      }

      // Contar total
      const countPipeline = [...pipeline];
      countPipeline.push({ $count: 'total' });

      // Paginación
      pipeline.push(
        { $skip: skip },
        { $limit: pageSize }
      );

      const [countResult, accounts] = await Promise.all([
        Accounts.aggregate(countPipeline).exec(),
        Accounts.aggregate(pipeline).exec()
      ]);

      const total = countResult[0]?.total || 0;

      return {
        accounts,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      };
    } catch (error) {
      console.error('Error listing accounts:', error);
      throw new Error('Error al listar cuentas');
    }
  }
};
