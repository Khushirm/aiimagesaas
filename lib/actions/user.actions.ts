"use server";

import { revalidatePath } from "next/cache";

import User from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";


export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();

    const newUser = await User.create(user);

    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError(error);
  }
}


export async function getUserById(userId: string) {
  try {
    console.log(`Connecting to database...`);
    await connectToDatabase();
    console.log(`Searching for user with clerkId: ${userId}`);
    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      // console.error(`User not found for clerkId: ${userId}`);
      console.warn(`User not found, creating a new one for testing.`);
      // throw new Error("User not found");
      try {
        user = new User({
          clerkId: userId,
          email: `test_${userId}@example.com`,
          username: `test_user_${userId}`,
          photo: `https://example.com/photo.jpg`,
          firstName: "Test",
          lastName: "User",
        });
        await user.save();
        console.log(`Test user created: ${JSON.stringify(user)}`);
      } catch (creationError) {
        if (creationError instanceof Error) {
        console.error(`Error creating test user: ${creationError.message}`);
        throw creationError;
      }else {
        console.error(`Unknown error creating test user: ${JSON.stringify(creationError)}`);
        throw new Error("Unknown error occurred during user creation");
      }
    }
  }
    console.log(`User found: ${JSON.stringify(user)}`);
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}


export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
      new: true,
    });

    if (!updatedUser) throw new Error("User update failed");
    
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}

export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase();

    
    const userToDelete = await User.findOne({ clerkId });

    if (!userToDelete) {
      throw new Error("User not found");
    }

    
    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    revalidatePath("/");

    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (error) {
    handleError(error);
  }
}


export async function updateCredits(userId: string, creditFee: number) {
  try {
    await connectToDatabase();

    const updatedUserCredits = await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { creditBalance: creditFee }},
      { new: true }
    )

    if(!updatedUserCredits) throw new Error("User credits update failed");

    return JSON.parse(JSON.stringify(updatedUserCredits));
  } catch (error) {
    handleError(error);
  }
}