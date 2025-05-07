import { gql } from "apollo-server-express";

export const types = gql`
  enum SortDirection {
    ASC
    DESC
  }

  input PaginationInput {
    page: Int! = 1
    pageSize: Int! = 10
    sortBy: String
    sortDirection: SortDirection = ASC
  }

  type PaginationInfo {
    total: Int!
    page: Int!
    pageSize: Int!
    totalPages: Int!
  }
`;