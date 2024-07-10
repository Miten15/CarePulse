"use server";

import { ID, Query } from "node-appwrite";
import { users } from "../appwrite.config";
import { parseStringify } from "../utils";
import { InputFile } from "node-appwrite/file";

export const createUser = async (user: CreateUserParams) => {
  try {
    // Create new user -> https://appwrite.io/docs/references/1.5.x/server-nodejs/users#create
    const newuser = await users.create(
      ID.unique(),
      user.email,
      user.phone,
      undefined,
      user.name
    );

    return parseStringify(newuser);
  } catch (error: any) {
    // Detailed error logging
    console.error("Error creating user:", error.message, {
      code: error.code,
      response: error.response,
    });

    // Check existing user
    if (error && error?.code === 409) {
      try {
        const existingUser = await users.list([
          Query.equal("email", [user.email]),
        ]);

        return existingUser.users[0];
      } catch (listError: any) {
        console.error("Error listing existing user:", listError.message, {
          code: listError.code,
          response: listError.response,
        });
        throw listError; // Re-throw to propagate the error
      }
    }

    throw error; // Re-throw to propagate the error
  }
};

// GET USER
export const getUser = async (userId: string) => {
  try {
    const user = await users.get(userId);
    return parseStringify(user);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the user details:",
      error
    );
  }
};
