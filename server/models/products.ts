import { Schema } from "mongoose";

import { IProduct } from "../interfaces/product";

import { cnxProducts } from "../db/mongodb";

const productsSchema = new Schema<IProduct>(
  {
    name: { type: String },
    sku: { type: String },
    accountId: { type: String, required: true },
  },
  { timestamps: true }
);

const Products = cnxProducts.model<IProduct>("Products", productsSchema);

export default Products;
