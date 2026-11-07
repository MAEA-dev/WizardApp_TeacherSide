import { auth, db, functions } from "./firebaseConfig";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  httpsCallable,
} from "firebase/functions";

const createUserFn = httpsCallable(functions, "createUser");
export const ADMIN_EMAIL = "alcantaramark638@gmail.com";

export const createUser = async (data) => {
  try {
    const response = await createUserFn(data);
    return response.data;
  } catch (error) {
    console.log("Create user error:", error);
    throw error;
  }
};

export const loginUsername = async ({
  username,
  email,
  password,
  expectedRole = "teacher",
}) => {
  try {
    const identifier = String(username ?? email ?? "")
      .trim()
      .toLowerCase();

    if (!identifier) {
      const error = new Error("Username or email is required.");
      error.code = "identifier/empty";
      throw error;
    }

    if (!password) {
      const error = new Error("Password is required.");
      error.code = "password/empty";
      throw error;
    }

    let loginEmail = identifier;


    if (!identifier.includes("@")) {
      const usernameRef = doc(db, "usernames", identifier);
      const usernameSnap = await getDoc(usernameRef);

      if (!usernameSnap.exists()) {
        const error = new Error("No account found.");
        error.code = "identifier/not-found";
        throw error;
      }

      loginEmail = usernameSnap.data().email;
    }


    const userCredential = await signInWithEmailAndPassword(
      auth,
      loginEmail,
      password
    );

    const user = userCredential.user;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await signOut(auth);
      throw new Error("User profile not found.");
    }

    const authenticatedUser = userSnap.data();
    const role =
      user.email?.toLowerCase() === ADMIN_EMAIL &&
      authenticatedUser.role === "admin"
        ? "admin"
        : expectedRole;

    if (authenticatedUser.role !== role) {
      await signOut(auth);

      const error = new Error(
        `This account is not registered as a ${role}.`
      );

      error.code = "user/role-mismatch";
      throw error;
    }

    return role;

  } catch (error) {
    console.log("Login error:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.log("Logout error:", error);
    return false;
  }
};

export const watchCurrentUserUid = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user ? user.uid : null);
  });
};

export const getCurrentUserUid = () => {
  return auth.currentUser?.uid || null;
};

export const getCurrentUser = () => {
  return auth.currentUser || null;
};

export const getAuthErrorMessage = (error) => {
  switch (error.code) {
    case "identifier/empty":
      return "Please enter your username or email.";

    case "password/empty":
      return "Please enter your password.";

    case "identifier/not-found":
      return "No account found with that username or email.";

    case "identifier/email-missing":
      return "This account is missing login information.";

    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect username/email or password.";

    case "auth/network-request-failed":
      return "Check your internet connection.";

    case "auth/user-disabled":
      return "This account has been disabled.";

    case "auth/too-many-requests":
      return "Too many login attempts. Try again later.";

    case "auth/user-not-found":
      return "User account not found.";

    case "functions/already-exists":
      return "Username or email already exists.";

    case "functions/invalid-argument":
      return error.message || "Please check your registration details.";

    case "functions/permission-denied":
      return "Permission denied.";

    case "functions/unavailable":
    case "functions/deadline-exceeded":
      return "Server unavailable.";

    case "functions/internal":
      return "Unable to create your account right now. Please try again.";

    default:
      return (
        error.message ||
        "Something went wrong. Please try again."
      );
  }
};