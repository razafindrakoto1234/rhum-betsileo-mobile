import { collection, getDocs, query, where } from "firebase/firestore";
import { PointOfSaleData } from "../../types/pointOfSale";
import { db } from "../../config/firebase";

export async function fetchPOSByUser(
  userId: string,
): Promise<PointOfSaleData[]> {
  if (!userId) return [];

  try {
    const posRef = collection(db, "pointsOfSale");

    const q = query(
      posRef,
      where("idUser", "==", userId),
      where("status", "==", "ACTIVE"),
    );

    const querySnapshot = await getDocs(q);
    const posList: PointOfSaleData[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      posList.push({
        idPOS: doc.id,
        name: data.name,
        location: data.location,
        status: data.status,
        idUser: data.idUser,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    return posList;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des points de vente :",
      error,
    );
    throw new Error("Impossible de charger vos points de vente.");
  }
}
