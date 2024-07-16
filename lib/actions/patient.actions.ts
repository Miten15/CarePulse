"use server";

import { ID, Query } from "node-appwrite";
import {
  databases,
  ENDPOINT,
  PATIENT_COLLECTION_ID,
  PROJECT_ID,
  storage,
  users,
} from "../appwrite.config";
import { parseStringify } from "../utils";
import { InputFile } from "node-appwrite/file";
import { BUCKET_ID, DATABASE_ID } from "../appwrite.config";
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

export const registerPatient = async ({
  identificationDocument,
  ...patient
}: RegisterUserParams) => {
  try {
    // Upload identification document
    let file;
    if (identificationDocument) {
      const inputFile = InputFile.fromBuffer(
        identificationDocument?.get("blobFile") as Blob,
        identificationDocument?.get("fileName") as string
      );
      file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
    }

    console.log(
      {
        identificationDocument,
        patient,
        file,
        bucketId: BUCKET_ID,
        databaseId: DATABASE_ID,
        patientCollectionId: PATIENT_COLLECTION_ID,
        project: PROJECT_ID,
        endpoint: ENDPOINT,
        userId: patient.userId,
        identificationDocumentId: file?.$id || null,
        identificationDocumentUrl: `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        address: patient.address,
      },
      "is this even working?"
    );

    const newPatient = await databases.createDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      ID.unique(),
      {
        identificationDocumentId: file?.$id || null,
        identificationDocumentUrl: `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`,
        ...patient,
      }
    );
    return parseStringify(newPatient);
  } catch (error) {
    console.log(error);
  }
};

export const getPatient = async (userId: string) => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("userId", [userId])]
    );
    return parseStringify(patients.documents[0]);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the user details:",
      error
    );
  }
};
