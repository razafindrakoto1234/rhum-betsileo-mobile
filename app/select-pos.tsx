// app/select-pos.tsx
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { auth, db } from "../src/config/firebase";
import {
  ArrowRight,
  LogOut,
  MapPin,
  Store,
  CheckCircle2,
  Phone,
  Mail,
  Search,
  X,
  Edit3,
} from "lucide-react-native";
import { PointOfSaleData } from "../src/types/pointOfSale";
import { fetchPOSByUser } from "../src/service/pos/fetchPOSByUser";
import { searchPOSByUser } from "../src/service/pos/searchPOS";
import { EditUserModal } from "../src/components/editUserModal";

// Importation locale de ton logo
const rhumLogo = require("../assets/images/images.jpg");

export default function SelectPOSScreen() {
  const [posList, setPosList] = useState<PointOfSaleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingLogout, setLoadingLogout] = useState(false);

  // États pour la recherche et l'ID utilisateur
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // États pour l'utilisateur connecté
  const [userName, setUserName] = useState("Administrateur");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  // État d'affichage du modal séparé
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const loadUserDataAndPOS = async () => {
      try {
        setLoading(true);
        const currentUser = auth.currentUser;

        if (!currentUser || !currentUser.email) {
          router.replace("/");
          return;
        }

        setUserEmail(currentUser.email);

        // 1. Récupérer les informations de l'utilisateur dans la collection 'users'
        const usersRef = collection(db, "users");
        const userQuery = query(
          usersRef,
          where("mail", "==", currentUser.email),
          limit(1),
        );
        const userSnapshot = await getDocs(userQuery);

        let targetUserId = currentUser.uid;

        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          const userData = userDoc.data();
          targetUserId = userDoc.id;

          if (userData.name) setUserName(userData.name);

          const phoneValue =
            userData.smartphone ||
            userData.phone ||
            userData.phoneNumber ||
            userData.contact ||
            userData.tel;
          if (phoneValue) setUserPhone(phoneValue);

          if (userData.photoURL) setUserPhoto(userData.photoURL);
        }

        setCurrentUserId(targetUserId);

        // 2. Charger les points de vente initiaux associés à cet utilisateur
        const userPOS = await fetchPOSByUser(targetUserId);

        setPosList(userPOS);
        if (userPOS.length > 0) {
          setSelectedId(userPOS[0].idPOS);
        }
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
        Alert.alert("Erreur", "Impossible de charger vos données.");
      } finally {
        setLoading(false);
      }
    };

    loadUserDataAndPOS();
  }, []);

  // Déclenchement de la recherche via le service dédié dès que searchQuery change
  useEffect(() => {
    const handleSearch = async () => {
      if (!currentUserId) return;

      try {
        const results = await searchPOSByUser(currentUserId, searchQuery);
        setPosList(results);

        if (
          results.length > 0 &&
          (!selectedId || !results.some((p) => p.idPOS === selectedId))
        ) {
          setSelectedId(results[0].idPOS);
        }
      } catch (error) {
        console.error("Erreur de recherche:", error);
      }
    };

    const delayDebounce = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, currentUserId]);

  const handleConfirm = () => {
    if (!selectedId) {
      Alert.alert(
        "Sélection requise",
        "Veuillez sélectionner un point de vente.",
      );
      return;
    }
    router.replace("/dashboard");
  };

  const handleLogout = async () => {
    try {
      setLoadingLogout(true);
      await signOut(auth);
      router.replace("/");
    } catch (error: any) {
      console.error("Erreur lors de la déconnexion:", error);
      Alert.alert("Erreur", "Impossible de se déconnecter.");
    } finally {
      setLoadingLogout(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête du haut : "Hello," aligné avec le logo */}
      <View style={styles.topHeader}>
        <Text style={styles.helloText}>Hello,</Text>
        <View style={styles.logoContainer}>
          <Image source={rhumLogo} style={styles.logoImage} />
        </View>
      </View>

      {/* Cadre Bleu avec l'utilisateur connecté et le bouton de modification */}
      <View style={styles.userCard}>
        <TouchableOpacity
          style={styles.editButton}
          activeOpacity={0.7}
          onPress={() => setIsEditModalOpen(true)}
        >
          <Edit3 size={16} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.userCardTopRow}>
          <View style={styles.avatarContainer}>
            {userPhoto ? (
              <Image source={{ uri: userPhoto }} style={styles.avatar} />
            ) : (
              <Text style={styles.avatarInitials}>
                {userName.substring(0, 2).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.cardUserName} numberOfLines={1}>
              {userName}
            </Text>

            <View style={styles.contactRow}>
              <Mail size={13} color="#e0e7ff" style={styles.contactIcon} />
              <Text style={styles.cardUserDetail} numberOfLines={1}>
                {userEmail}
              </Text>
            </View>

            {userPhone ? (
              <View style={styles.contactRow}>
                <Phone size={13} color="#e0e7ff" style={styles.contactIcon} />
                <Text style={styles.cardUserDetail} numberOfLines={1}>
                  {userPhone}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {/* Titre de section : Choisir un point de vente */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Choisir un point de vente</Text>
        <Text style={styles.sectionSubtitle}>
          Sélectionnez l'emplacement pour votre session
        </Text>
      </View>

      {/* Barre de recherche connectée au service searchPOSByUser */}
      <View style={styles.searchContainer}>
        <Search size={18} color="#64748b" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un point de vente..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <X size={18} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loaderText}>
            Chargement de vos points de vente...
          </Text>
        </View>
      ) : posList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery
              ? "Aucun point de vente ne correspond à votre recherche."
              : "Aucun point de vente actif ne vous est assigné."}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer}>
          {posList.map((pos) => {
            const isSelected = selectedId === pos.idPOS;
            return (
              <TouchableOpacity
                key={pos.idPOS}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => setSelectedId(pos.idPOS)}
                activeOpacity={0.7}
              >
                <View style={styles.cardContent}>
                  <View
                    style={[
                      styles.storeIconBox,
                      isSelected && styles.storeIconBoxSelected,
                    ]}
                  >
                    <Store
                      size={20}
                      color={isSelected ? "#ffffff" : "#2563eb"}
                    />
                  </View>
                  <View style={styles.cardTextContainer}>
                    <Text
                      style={[
                        styles.cardTitle,
                        isSelected && styles.cardTitleSelected,
                      ]}
                    >
                      {pos.name}
                    </Text>
                    {pos.location && (
                      <View style={styles.locationRow}>
                        <MapPin
                          size={13}
                          color="#64748b"
                          style={styles.pinIcon}
                        />
                        <Text style={styles.cardLocation}>{pos.location}</Text>
                      </View>
                    )}
                  </View>
                  {isSelected && (
                    <CheckCircle2
                      size={20}
                      color="#2563eb"
                      style={styles.checkIcon}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Boutons du bas */}
      <View style={styles.footer}>
        {posList.length > 0 && (
          <TouchableOpacity style={styles.button} onPress={handleConfirm}>
            <Text style={styles.buttonText}>Confirmer le point de vente</Text>
            <ArrowRight size={18} color="#ffffff" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loadingLogout}
          activeOpacity={0.7}
        >
          <LogOut size={16} color="#ef4444" style={styles.logoutIcon} />
          <Text style={styles.logoutButtonText}>
            {loadingLogout ? "Déconnexion..." : "Se déconnecter"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Appel du Modal de modification séparé */}
      <EditUserModal
        visible={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userId={currentUserId}
        initialData={{
          name: userName,
          mail: userEmail,
          smartphone: userPhone,
          photoURL: userPhoto || "",
        }}
        onUpdateSuccess={(updated) => {
          setUserName(updated.name);
          setUserEmail(updated.mail);
          setUserPhone(updated.smartphone);
          if (updated.photoURL !== undefined) setUserPhoto(updated.photoURL);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 4,
  },
  helloText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#64748b",
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 2.5,
    borderColor: "#2563eb",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  logoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  userCard: {
    marginHorizontal: 24,
    marginTop: 32,
    marginBottom: 20,
    backgroundColor: "#2563eb",
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 18,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    position: "relative",
  },
  editButton: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 8,
    borderRadius: 12,
    zIndex: 10,
  },
  userCardTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginRight: 16,
    borderWidth: 2.5,
    borderColor: "#ffffff",
  },
  avatar: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  avatarInitials: {
    color: "#2563eb",
    fontWeight: "bold",
    fontSize: 20,
  },
  userInfo: {
    flex: 1,
  },
  cardUserName: {
    fontSize: 19,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  contactIcon: {
    marginRight: 6,
  },
  cardUserDetail: {
    fontSize: 13,
    color: "#e0e7ff",
    fontWeight: "500",
  },
  sectionHeader: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    marginHorizontal: 24,
    marginBottom: 14,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0f172a",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    marginTop: 10,
    color: "#64748b",
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center",
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 10,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  cardSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#f0fdf4",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  storeIconBox: {
    width: 38,
    height: 38,
    backgroundColor: "#eff6ff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  storeIconBoxSelected: {
    backgroundColor: "#2563eb",
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  cardTitleSelected: {
    color: "#1d4ed8",
    fontWeight: "bold",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  pinIcon: {
    marginRight: 3,
  },
  cardLocation: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  checkIcon: {
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    height: 48,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },
  logoutButton: {
    backgroundColor: "#fef2f2",
    borderRadius: 14,
    height: 44,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  logoutIcon: {
    marginRight: 6,
  },
  logoutButtonText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "600",
  },
});
