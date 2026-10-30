import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

export interface UpdateUserData {
  name?: string;
  mail?: string;
  smartphone?: string;
  photoURL?: string;
}

export async function updateUserProfile(
  userId: string,
  updatedData: UpdateUserData,
): Promise<void> {
  try {
    if (!userId) {
      throw new Error("ID utilisateur requis pour la mise à jour.");
    }

    const userRef = doc(db, "users", userId);

    const cleanData: Record<string, any> = {};
    if (updatedData.name !== undefined) cleanData.name = updatedData.name;
    if (updatedData.mail !== undefined) cleanData.mail = updatedData.mail;
    if (updatedData.smartphone !== undefined)
      cleanData.smartphone = updatedData.smartphone;
    if (updatedData.photoURL !== undefined)
      cleanData.photoURL = updatedData.photoURL;

    await updateDoc(userRef, cleanData);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    throw error;
  }
}
