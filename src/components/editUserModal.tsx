// src/components/EditUserModal.tsx
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Image,
  Alert,
} from "react-native";
import { X, User, Camera } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy"; // Import pour lire l'image en Base64
import { updateUserProfile } from "../service/user/update-user-service";

interface EditUserModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string | null;
  initialData: {
    name: string;
    mail: string;
    smartphone: string;
    photoURL?: string;
  };
  onUpdateSuccess: (updatedData: {
    name: string;
    mail: string;
    smartphone: string;
    photoURL?: string;
  }) => void;
}

export function EditUserModal({
  visible,
  onClose,
  userId,
  initialData,
  onUpdateSuccess,
}: EditUserModalProps) {
  const [name, setName] = useState(initialData.name);
  const [mail, setMail] = useState(initialData.mail);
  const [smartphone, setSmartphone] = useState(initialData.smartphone);
  const [photoURL, setPhotoURL] = useState(initialData.photoURL || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(initialData.name || "");
    setMail(initialData.mail || "");
    setSmartphone(initialData.smartphone || "");
    setPhotoURL(initialData.photoURL || "");
  }, [initialData, visible]);

  // Sélectionner l'image depuis la galerie
  const handlePickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission refusée",
          "L'accès à la galerie est requis pour changer la photo.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Qualité réduite pour éviter de surcharger Firestore avec des fichiers trop lourds
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoURL(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erreur lors de la sélection de l'image:", error);
      Alert.alert("Erreur", "Impossible de sélectionner l'image.");
    }
  };

  // Convertir l'image locale en Base64 si c'est un fichier du téléphone
  const convertImageToBase64IfNeeded = async (uri: string): Promise<string> => {
    if (
      !uri ||
      uri.startsWith("http://") ||
      uri.startsWith("https://") ||
      uri.startsWith("data:image")
    ) {
      return uri; // Déjà un lien web ou déjà en Base64
    }

    try {
      // Lecture du fichier local en Base64 via FileSystem
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error("Erreur conversion Base64:", error);
      return uri;
    }
  };

  const handleSave = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // 1. Conversion de l'image locale en Base64
      const finalPhotoURL = await convertImageToBase64IfNeeded(photoURL);

      // 2. Enregistrement direct dans Firestore
      await updateUserProfile(userId, {
        name,
        mail,
        smartphone,
        photoURL: finalPhotoURL,
      });

      onUpdateSuccess({ name, mail, smartphone, photoURL: finalPhotoURL });
      onClose();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      Alert.alert("Erreur", "Impossible d'enregistrer les modifications.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Modifier mon profil</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={22} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Aperçu de la photo de profil */}
            <View style={styles.avatarPreviewContainer}>
              <TouchableOpacity
                style={styles.avatarWrapper}
                activeOpacity={0.8}
                onPress={handlePickImage}
              >
                {photoURL ? (
                  <Image
                    source={{ uri: photoURL }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <User size={30} color="#2563eb" />
                  </View>
                )}
                <View style={styles.cameraBadge}>
                  <Camera size={12} color="#ffffff" />
                </View>
              </TouchableOpacity>
              <Text style={styles.avatarSubtitle}>
                Appuyez pour changer la photo
              </Text>
            </View>

            {/* Nom */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom complet</Text>
              <TextInput
                style={styles.modalInput}
                value={name}
                onChangeText={setName}
                placeholder="Entrez votre nom"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Adresse email</Text>
              <TextInput
                style={styles.modalInput}
                value={mail}
                onChangeText={setMail}
                placeholder="Entrez votre email"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
              />
            </View>

            {/* Téléphone */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Numéro de téléphone</Text>
              <TextInput
                style={styles.modalInput}
                value={smartphone}
                onChangeText={setSmartphone}
                placeholder="Entrez votre numéro"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
              />
            </View>

            {/* URL / Code de la photo */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>URL ou données de l'image</Text>
              <TextInput
                style={styles.modalInput}
                value={photoURL}
                onChangeText={setPhotoURL}
                placeholder="https://... ou base64"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Boutons d'action */}
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={onClose}
              >
                <Text style={styles.cancelModalButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveModalButton, loading && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={loading}
              >
                <Text style={styles.saveModalButtonText}>
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  avatarPreviewContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#eff6ff",
    borderWidth: 2.5,
    borderColor: "#2563eb",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    position: "relative",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#2563eb",
    padding: 6,
    borderTopLeftRadius: 10,
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },
  avatarSubtitle: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0f172a",
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 20,
  },
  cancelModalButton: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginRight: 8,
  },
  cancelModalButtonText: {
    color: "#475569",
    fontWeight: "bold",
    fontSize: 14,
  },
  saveModalButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginLeft: 8,
  },
  saveModalButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
