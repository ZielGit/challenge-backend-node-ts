import { GraphQLError } from "graphql";
import { Types } from "mongoose";

export const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    throw new GraphQLError("Invalid email format");
  }
};

export const validateObjectId = (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new GraphQLError("Invalid ID format");
  }
};

export const validatePagination = (page: number, pageSize: number) => {
  if (page < 1 || pageSize < 1) {
    throw new GraphQLError("Pagination parameters must be positive integers");
  }
};
