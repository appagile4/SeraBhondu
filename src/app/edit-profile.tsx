import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  updateUserProfile,
  uploadAvatarImage,
} from "../store/slices/authSlice";
import { POPULAR_CITIES } from "../constants/locations";
import { THEME } from "../constants/theme";
import { useLanguage } from "../hooks/useLanguage";

export default function EditProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t, isBn } = useLanguage();
  const user = useAppSelector((state) => state.auth.user);

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [city, setCity] = useState(user?.city || "Dhaka");
  const [about, setAbout] = useState(user?.about || "");
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.phone) setPhone(user.phone);
      if (user.city) setCity(user.city);
      if (user.about) setAbout(user.about);
    }
  }, [user]);

  const userInitials = (user?.name || "User")
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "U";

  const handlePickAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t("permissionRequired"), t("permissionPhotoLibrary"));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const formData = new FormData();
        const filename = asset.uri.split("/").pop() || "avatar.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("image", {
          uri: asset.uri,
          name: filename,
          type,
        } as any);
        formData.append("avatar", {
          uri: asset.uri,
          name: filename,
          type,
        } as any);

        setAvatarUploading(true);
        setAvatarError(false);
        await dispatch(uploadAvatarImage(formData)).unwrap();
        Alert.alert(t("successTitle"), t("photoUpdatedSuccess"));
      }
    } catch (err: any) {
      Alert.alert(t("failedTitle"), err || t("photoUpdateFailed"));
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t("nameRequired"), t("nameRequiredDesc"));
      return;
    }

    setSaving(true);
    try {
      await dispatch(
        updateUserProfile({
          name: name.trim(),
          phone: phone.trim() || undefined,
          city,
          about: about.trim() || undefined,
        })
      ).unwrap();

      Alert.alert(t("successTitle"), t("profileUpdateSuccess"), [
        { text: t("okText"), onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert(t("failedTitle"), err || t("profileUpdateFailed"));
    } finally {
      setSaving(false);
    }
  };

  const currentAvatar =
    user?.avatar ||
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={THEME.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("editProfile")}</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            {avatarError || !user?.avatar ? (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarFallbackText}>{userInitials}</Text>
              </View>
            ) : (
              <Image
                source={{ uri: user.avatar }}
                style={styles.avatar}
                contentFit="cover"
                transition={200}
                onError={() => setAvatarError(true)}
              />
            )}
            {avatarUploading && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color="#FFFFFF" size="small" />
              </View>
            )}
            <TouchableOpacity
              style={styles.cameraBtn}
              onPress={handlePickAvatar}
              disabled={avatarUploading}
            >
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.changePhotoText}>{t("changePhoto")}</Text>
        </View>

        {/* Inputs */}
        <View style={styles.formCard}>
          <Text style={styles.inputLabel}>{t("fullNameLabel")}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={t("fullNamePlaceholder")}
            placeholderTextColor={THEME.colors.textMuted}
          />

          <Text style={[styles.inputLabel, { marginTop: 14 }]}>{t("phoneLabel")}</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder={t("phonePlaceholder")}
            placeholderTextColor={THEME.colors.textMuted}
          />

          <Text style={[styles.inputLabel, { marginTop: 14 }]}>{t("cityDistrictLabel")}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityScroll}>
            {POPULAR_CITIES.filter((c) => c.id !== "all-bangladesh").map((c) => {
              const isSelected = city === c.name;
              const cityName = isBn ? (c.nameBn || c.name) : c.name;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.cityChip, isSelected && styles.cityChipActive]}
                  onPress={() => setCity(c.name)}
                >
                  <Text style={[styles.cityChipText, isSelected && styles.cityChipTextActive]}>
                    {cityName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={[styles.inputLabel, { marginTop: 14 }]}>{t("aboutBioLabel")}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={about}
            onChangeText={setAbout}
            placeholder={t("aboutBioPlaceholder")}
            placeholderTextColor={THEME.colors.textMuted}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>{t("saveChanges")}</Text>
          )}
        </TouchableOpacity>

        {/* Delete Account Action */}
        <TouchableOpacity
          style={styles.deleteAccountBtn}
          onPress={() => router.push("/delete-account" as any)}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color={THEME.colors.danger} />
          <Text style={styles.deleteAccountBtnText}>{t("deleteAccount")}</Text>
        </TouchableOpacity>
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
  },
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: THEME.colors.text,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: "center",
    marginVertical: 16,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#E2E8F0",
  },
  avatarFallback: {
    backgroundColor: THEME.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },
  avatarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 45,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: THEME.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  changePhotoText: {
    fontSize: 12,
    color: THEME.colors.primary,
    fontWeight: "600",
    marginTop: 8,
  },
  formCard: {
    backgroundColor: THEME.colors.surface,
    padding: 16,
    borderRadius: THEME.radii.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 20,
    ...THEME.shadows.sm,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.colors.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radii.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: THEME.colors.text,
  },
  textArea: {
    height: 70,
    textAlignVertical: "top",
  },
  cityScroll: {
    flexDirection: "row",
  },
  cityChip: {
    backgroundColor: THEME.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.radii.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginRight: 6,
  },
  cityChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  cityChipText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: "500",
  },
  cityChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  saveBtn: {
    backgroundColor: THEME.colors.primary,
    height: 48,
    borderRadius: THEME.radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  deleteAccountBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: 14,
    gap: 6,
    borderRadius: THEME.radii.md,
    borderWidth: 1,
    borderColor: THEME.colors.danger,
    backgroundColor: THEME.colors.dangerLight,
  },
  deleteAccountBtnText: {
    color: THEME.colors.danger,
    fontSize: 13,
    fontWeight: "700",
  },
});
