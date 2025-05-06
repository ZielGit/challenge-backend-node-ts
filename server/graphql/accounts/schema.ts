import { gql } from "apollo-server-express";

export const schema = gql`
  type Account {
    _id: ID!
    name: String!
    email: String!
    createdAt: String!
    updatedAt: String!
  }

  type AccountList {
    accounts: [Account!]!
    total: Int!
    page: Int!
    pageSize: Int!
    totalPages: Int!
  }

  input AccountInput {
    name: String!
    email: String!
  }

  extend type Query {
    testAccQ: Int
    listAccounts(page: Int, pageSize: Int, search: String): AccountList!
  }

  extend type Mutation {
    testAccM: Boolean
    addAccount(input: AccountInput!): Account!
  }
`;
