import { collection, getDocs, query, where } from "firebase/firestore";
import { UserData } from "../../types/user";
import { db } from "../../config/firebase";

export async function fetchApprovedAdmins(): Promise<UserData[]> {
  try {
    const q = query(collection(db, "users"), where("status", "==", "APPROVED"));
    const querySnapshot = await getDocs(q);

    const adminList: UserData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.isBlocked) {
        adminList.push({
          idUser: doc.id,
          name: data.name || "",
          mail: data.mail || "",
          smartphone: data.smartphone || "",
          photoURL: data.photoURL || "",
          responsability: data.responsability || "Simple",
          isBlocked: data.isBlocked || false,
          status: data.status,
          createdAt: data.createdAt || "",
        });
      }
    });
    return adminList;
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    throw new Error("Impossible de charger la liste des administrateurs.");
  }
}
