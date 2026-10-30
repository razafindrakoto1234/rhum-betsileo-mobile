import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase";

export async function loginUser(
  email: string,
  password: string,
): Promise<void> {
  if (!email || !password) {
    throw new Error("L'Email et le mot de passe sont obligatoire.");
  }

  try {
    await signInWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password,
    );
  } catch (error: any) {
    console.error("Erreur dans loginUser :", error);

    let message = "Impossible de vous connecter. Vérifiez vos identifiants.";
    if (
      error.code === "auth/wrong-password" ||
      error.code === "auth/invalid-credential"
    ) {
      message = "Mot de passe incorrect.";
    } else if (error.code === "auth/user-not-found") {
      message = "Utilisateur introuvable.";
    }

    throw new Error(message);
  }
}
