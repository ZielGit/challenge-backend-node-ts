import { gql } from "apollo-server-express";

export const schema = gql`
  type Product {
    _id: ID!
    name: String!
    sku: String!
    accountId: String!
    account: Account
    createdAt: String!
    updatedAt: String!
  }

  type ProductList {
    products: [Product!]!
    total: Int!
    page: Int!
    pageSize: Int!
    totalPages: Int!
  }

  input ProductInput {
    name: String!
    sku: String!
    accountId: String!
  }

  extend type Query {
    listProducts(
      page: Int
      pageSize: Int
      search: String
      accountId: String
    ): ProductList!
  }

  extend type Mutation {
    addProducts(products: [ProductInput!]!): [Product!]!
  }
`;
