// app/index.tsx (ou ton fichier LoginScreen)
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Eye, EyeOff, LogIn } from "lucide-react-native"; // Import des icônes d'œil et de connexion
import { UserData } from "../src/types/user";
import { fetchApprovedAdmins } from "../src/service/user/get-user-service";
import { loginUser } from "../src/service/login/auth-service";

export default function LoginScreen() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // État pour basculer la visibilité du mot de passe
  const [showPassword, setShowPassword] = useState(false);

  // États pour la liste des administrateurs et le select personnalisé
  const [admins, setAdmins] = useState<UserData[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState<UserData | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Charger les administrateurs au démarrage via ton service
  useEffect(() => {
    const loadAdmins = async () => {
      try {
        setLoadingAdmins(true);
        const adminList = await fetchApprovedAdmins();
        setAdmins(adminList);
        if (adminList.length > 0) {
          setSelectedAdmin(adminList[0]); // Sélectionne le premier par défaut
        }
      } catch (error) {
        console.error("Erreur chargement admins:", error);
        Alert.alert(
          "Erreur",
          "Impossible de charger la liste des administrateurs.",
        );
      } finally {
        setLoadingAdmins(false);
      }
    };

    loadAdmins();
  }, []);

  const handleLogin = async () => {
    if (!selectedAdmin || !selectedAdmin.mail) {
      Alert.alert(
        "Compte requis",
        "Veuillez sélectionner un compte administrateur.",
      );
      return;
    }
    if (!password) {
      Alert.alert("Mot de passe requis", "Veuillez entrer votre mot de passe.");
      return;
    }

    setLoading(true);
    try {
      // Appel de ton service de login propre
      await loginUser(selectedAdmin.mail, password);

      // Redirection fluide vers l'écran de choix du point de vente
      router.replace("/select-pos");
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      Alert.alert(
        "Échec de connexion",
        error.message || "Vérifiez vos identifiants.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />

      {/* En-tête avec Dégradé */}
      <LinearGradient
        colors={["#0f172a", "#1e3a8a", "#2563eb"]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Image
            source={require("../assets/images/images.jpg")}
            style={styles.logo}
            resizeMode="cover"
          />
          <Text style={styles.headerSubtitle}>Hello, Connectez-vous !</Text>
        </View>
      </LinearGradient>

      {/* Carte Blanche Arrondie Chevauchante */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.cardContainer}
      >
        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>APPLICATION POUR LES AGENTS</Text>
          </View>

          {/* Sélection du Compte Administrateur */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Compte Administrateur</Text>
            {loadingAdmins ? (
              <View style={styles.loaderBox}>
                <ActivityIndicator size="small" color="#2563eb" />
                <Text style={styles.loaderText}>Chargement des profils...</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.dropdownSelector}
                onPress={() => setIsDropdownOpen(true)}
                activeOpacity={0.8}
              >
                {selectedAdmin ? (
                  <View style={styles.selectedAdminRow}>
                    <View style={styles.avatarContainer}>
                      {selectedAdmin.photoURL ? (
                        <Image
                          source={{ uri: selectedAdmin.photoURL }}
                          style={styles.avatar}
                        />
                      ) : (
                        <Text style={styles.avatarText}>
                          {(selectedAdmin.name || "A")
                            .substring(0, 2)
                            .toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <View style={styles.adminInfo}>
                      <Text style={styles.adminName} numberOfLines={1}>
                        {selectedAdmin.name}
                      </Text>
                      <Text style={styles.adminEmail} numberOfLines={1}>
                        {selectedAdmin.mail}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>
                    Sélectionner un compte
                  </Text>
                )}
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Champ Mot de passe avec Icône Œil */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIconContainer}
                activeOpacity={0.7}
              >
                {showPassword ? (
                  <Eye size={20} color="#64748b" />
                ) : (
                  <EyeOff size={20} color="#64748b" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={loading || loadingAdmins}
            style={styles.buttonWrapper}
          >
            <LinearGradient
              colors={["#1e40af", "#2563eb"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <View style={styles.buttonContentRow}>
                  <LogIn size={18} color="#ffffff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Se connecter</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              Application POS officielle • Ambalavao
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Modal de sélection d'administrateur */}
      <Modal
        visible={isDropdownOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choisir votre compte</Text>
            <ScrollView style={styles.modalScroll}>
              {admins.map((admin) => (
                <TouchableOpacity
                  key={admin.idUser}
                  style={[
                    styles.modalItem,
                    selectedAdmin?.idUser === admin.idUser &&
                      styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedAdmin(admin);
                    setIsDropdownOpen(false);
                  }}
                >
                  <View style={styles.avatarContainer}>
                    {admin.photoURL ? (
                      <Image
                        source={{ uri: admin.photoURL }}
                        style={styles.avatar}
                      />
                    ) : (
                      <Text style={styles.avatarText}>
                        {(admin.name || "A").substring(0, 2).toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <View style={styles.adminInfo}>
                    <Text style={styles.adminName}>{admin.name}</Text>
                    <Text style={styles.adminEmail}>{admin.mail}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setIsDropdownOpen(false)}
            >
              <Text style={styles.closeModalText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  headerGradient: {
    height: "38%",
    paddingHorizontal: 28,
    paddingTop: 50,
    justifyContent: "flex-start",
  },
  headerContent: {
    marginTop: 10,
    alignItems: "flex-start",
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#ffffff",
    marginBottom: 12,
  },
  headerSubtitle: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "800",
    marginTop: 4,
  },
  cardContainer: {
    flex: 1,
    marginTop: -30,
  },
  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 28,
    paddingTop: 32,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 20,
  },
  badgeText: {
    color: "#1d4ed8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 6,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "#cbd5e1",
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 15,
    color: "#0f172a",
  },
  eyeIconContainer: {
    padding: 6,
  },
  dropdownSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1.5,
    borderBottomColor: "#cbd5e1",
    paddingVertical: 8,
    backgroundColor: "transparent",
  },
  selectedAdminRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#c7d2fe",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    color: "#3730a3",
    fontWeight: "bold",
    fontSize: 11,
  },
  adminInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f172a",
  },
  adminEmail: {
    fontSize: 11,
    color: "#64748b",
  },
  placeholderText: {
    color: "#94a3b8",
    fontSize: 14,
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#64748b",
    paddingLeft: 8,
  },
  loaderBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  loaderText: {
    marginLeft: 8,
    color: "#64748b",
    fontSize: 12,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "500",
  },
  buttonWrapper: {
    borderRadius: 30,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
  },
  buttonContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  footerContainer: {
    marginTop: "auto",
    marginBottom: 20,
    alignItems: "center",
  },
  footerText: {
    color: "#94a3b8",
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "50%",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 16,
    textAlign: "center",
  },
  modalScroll: {
    marginBottom: 16,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 6,
  },
  modalItemSelected: {
    backgroundColor: "#eff6ff",
  },
  closeModalBtn: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  closeModalText: {
    color: "#475569",
    fontWeight: "bold",
    fontSize: 14,
  },
});
