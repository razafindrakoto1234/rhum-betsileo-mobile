import { collection, getDocs, query, where } from "firebase/firestore";
import { PointOfSaleData } from "../../types/pointOfSale";
import { db } from "../../config/firebase";

/**
 * Recherche les points de vente d'un utilisateur spécifique par nom ou localisation
 * @param userId L'ID de l'utilisateur connecté
 * @param searchTerm Le texte saisi dans la barre de recherche
 */

export async function searchPOSByUser(
  userId: string,
  searchTerm: string,
): Promise<PointOfSaleData[]> {
  try {
    const posRef = collection(db, "pointsOfSale");

    const q = query(posRef, where("idUser", "==", userId));

    const querySnapshot = await getDocs(q);
    const results: PointOfSaleData[] = [];

    const lowerSearchTerm = searchTerm.toLowerCase().trim();

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const name = (data.name || "").toLowerCase();
      const location = (data.location || "").toLowerCase();

      // Filtrage côté client sur le résultat de la requête sécurisée par idUser
      if (
        name.includes(lowerSearchTerm) ||
        location.includes(lowerSearchTerm)
      ) {
        results.push({
          idPOS: doc.id,
          name: data.name,
          location: data.location,
          status: data.status,
          idUser: data.idUser,
          createdAt: data.createdAt,
        });
      }
    });

    return results;
  } catch (error) {
    console.error("Erreur lors de la recherche des POS:", error);
    throw error;
  }
}
