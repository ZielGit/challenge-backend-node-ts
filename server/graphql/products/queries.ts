import Products from "../../models/products";

export const queries = {
  listProducts: async (
    _: any,
    args: {
      page?: number;
      pageSize?: number;
      search?: string;
      accountId?: string;
    }
  ) => {
    try {
      const { page = 1, pageSize = 10, search = '', accountId } = args;
      const skip = (page - 1) * pageSize;

      const pipeline: any[] = [];

      // Filtrado
      if (search) {
        pipeline.push({
          $match: {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { sku: { $regex: search, $options: 'i' } }
            ]
          }
        });
      }

      if (accountId) {
        pipeline.push({
          $match: { accountId }
        });
      }

      const countPipeline = [...pipeline, { $count: 'total' }];

      // Obtener datos con lookup para account
      const dataPipeline = [
        ...pipeline,
        { $skip: skip },
        { $limit: pageSize },
        {
          $lookup: {
            from: "accounts",
            let: { productAccountId: "$accountId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [
                      "$_id",
                      { $toObjectId: "$$productAccountId" } // Conversión explícita
                    ]
                  }
                }
              }
            ],
            as: "account"
          }
        },
        { $unwind: { path: "$account", preserveNullAndEmptyArrays: true } }
      ];

      const [countResult, products] = await Promise.all([
        Products.aggregate(countPipeline).exec(),
        Products.aggregate(dataPipeline).exec()
      ]);

      return {
        products,
        total: countResult[0]?.total || 0,
        page,
        pageSize,
        totalPages: Math.ceil((countResult[0]?.total || 0) / pageSize)
      };
    } catch (error) {
      console.error('Error listing products:', error);
      throw new Error('Error fetching products list');
    }
  }
};
