import { User as FirebaseUser } from "firebase/auth";
import type { User } from "../types";

export const mapFirebaseUser = (firebaseUser: FirebaseUser): Partial<User> => {
  return { id: firebaseUser.uid,
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? "",
    name: firebaseUser.displayName ?? "",
    full_name: firebaseUser.displayName ?? "",
    phone: firebaseUser.phoneNumber ?? "",
    phoneNumber: firebaseUser.phoneNumber ?? "",
    avatar: firebaseUser.photoURL ?? undefined,
    avatar_url: firebaseUser.photoURL ?? undefined,
    isVerified: firebaseUser.emailVerified,
    createdAt: new Date(firebaseUser.metadata.creationTime ?? Date.now()),
  }; };

