import React, { useState } from "react";
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
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setAuthModalVisible } from "../../store/slices/authSlice";
import { fetchMyAds } from "../../store/slices/myAdsSlice";
import { listingsApi, uploadApi } from "../../services/api";
import { CATEGORIES } from "../../constants/categories";
import { BANGLADESH_DIVISIONS, POPULAR_CITIES } from "../../constants/locations";
import { THEME } from "../../constants/theme";
import { useLanguage } from "../../hooks/useLanguage";

export default function PostAdScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { t, isEn, currencySymbol } = useLanguage();

  // Form state
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState<"Used" | "New">("Used");
  const [state, setState] = useState("Dhaka Division");
  const [city, setCity] = useState("Dhaka");
  const [area, setArea] = useState("");
  const [contactName, setContactName] = useState(user?.name || "");
  const [contactPhone, setContactPhone] = useState(user?.phone || "");

  // Photos
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Pick photos
  const handlePickImages = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "অনুমতি প্রয়োজন (Permission Required)",
          "বিজ্ঞাপনের ছবি যুক্ত করতে ফটো লাইব্রেরির অনুমতি দিন।"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 8,
      });

      if (!result.canceled && result.assets) {
        const uris = result.assets.map((a) => a.uri);
        setSelectedPhotos((prev) => [...prev, ...uris].slice(0, 8));
      }
    } catch (err) {
      console.warn("Image picker error:", err);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      dispatch(setAuthModalVisible(true));
      return;
    }

    if (!selectedCategory) {
      Alert.alert("ক্যাটাগরি নির্বাচন করুন", "বিজ্ঞাপন পোস্ট করতে একটি ক্যাটাগরি বেছে নিন।");
      return;
    }

    if (!title.trim() || title.trim().length < 8) {
      Alert.alert("বিজ্ঞাপনের শিরোনাম", "শিরোনাম কমপক্ষে ৮ অক্ষরের হতে হবে।");
      return;
    }

    if (!description.trim() || description.trim().length < 15) {
      Alert.alert("বিস্তারিত বিবরণ", "বিবরণ কমপক্ষে ১৫ অক্ষরের হতে হবে।");
      return;
    }

    const numPrice = Number(price.replace(/[^0-9.]/g, ""));
    if (isNaN(numPrice) || numPrice < 0) {
      Alert.alert("সঠিক মূল্য", "অনুগ্রহ করে বিজ্ঞাপনের সঠিক মূল্য (৳) দিন।");
      return;
    }

    if (!city) {
      Alert.alert("শহর / জেলা", "অনুগ্রহ করে আপনার শহর বা জেলা নির্বাচন করুন।");
      return;
    }

    setSubmitting(true);
    setUploading(true);

    try {
      // 1. Upload photos if any
      const uploadedImageObjects: Array<{ url: string; publicId?: string }> = [];

      if (selectedPhotos.length > 0) {
        const formData = new FormData();
        selectedPhotos.forEach((uri, idx) => {
          const filename = uri.split("/").pop() || `ad_photo_${idx}.jpg`;
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : "image/jpeg";
          formData.append("images", {
            uri: Platform.OS === "ios" ? uri.replace("file://", "") : uri,
            name: filename,
            type,
          } as any);
        });

        try {
          const uploadRes = await uploadApi.uploadMultiple(formData);
          if (uploadRes.data?.images) {
            uploadedImageObjects.push(...uploadRes.data.images);
          }
        } catch (uploadErr) {
          console.warn("Upload failed, submitting with placeholder:", uploadErr);
          // Fallback to placeholder if upload service is unreachable
          uploadedImageObjects.push({
            url: "https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&w=600&q=80",
          });
        }
      } else {
        uploadedImageObjects.push({
          url: "https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&w=600&q=80",
        });
      }

      setUploading(false);

      // 2. Create Advertisement payload
      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: numPrice,
        category: selectedCategory,
        subCategory: selectedSubCategory || undefined,
        condition,
        images: uploadedImageObjects,
        location: {
          state,
          city,
          area: area.trim(),
        },
        sellerContact: {
          name: contactName.trim() || user?.name,
          phone: contactPhone.trim() || user?.phone,
        },
      };

      const res = await listingsApi.create(payload);

      if (res.data?.success || res.data?.advertisement) {
        dispatch(fetchMyAds(true));
        Alert.alert(
          "বিজ্ঞাপন সফলভাবে পোস্ট হয়েছে!",
          "আপনার বিজ্ঞাপনটি সফলভাবে জমা দেওয়া হয়েছে।",
          [
            {
              text: "আমার বিজ্ঞাপন দেখুন",
              onPress: () => router.push("/my-ads" as any),
            },
            {
              text: "ঠিক আছে",
              onPress: () => router.push("/(tabs)" as any),
            },
          ]
        );
      } else {
        throw new Error(res.data?.message || "Failed to create listing");
      }
    } catch (err: any) {
      Alert.alert(
        "পোস্ট ব্যর্থ হয়েছে",
        err.response?.data?.message || err.message || "বিজ্ঞাপন পোস্ট করা যায়নি।"
      );
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  // If not logged in, prompt user
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.authPromptContainer}>
          <View style={styles.authIconCircle}>
            <Ionicons name="megaphone" size={32} color={THEME.colors.primary} />
          </View>
          <Text style={styles.authPromptTitle}>{t("postAdTitle")}</Text>
          <Text style={styles.authPromptSubtitle}>
            {t("postAdAuthSubtitle")}
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => dispatch(setAuthModalVisible(true))}
          >
            <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
            <Text style={styles.signInButtonText}>{t("loginOrSignUp")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentCategoryObj = CATEGORIES.find((c) => c.slug === selectedCategory);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("postAdTitle")}</Text>
        <Text style={styles.headerSubtitle}>
          {t("postAdSubtitle")}
        </Text>
      </View>

      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
        >
        {/* Step 1: Category Picker */}
        <Text style={styles.label}>১. ক্যাটাগরি নির্বাচন করুন *</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, isSelected && styles.catChipActive]}
                onPress={() => {
                  setSelectedCategory(cat.slug);
                  setSelectedSubCategory("");
                }}
              >
                <Image source={cat.image} style={styles.catChipImg} resizeMode="contain" />
                <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Step 2: Subcategory Picker */}
        {currentCategoryObj && currentCategoryObj.subCategories.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={styles.label}>সাব-ক্যাটাগরি</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subCatScroll}>
              {currentCategoryObj.subCategories.map((sub) => {
                const isSelected = selectedSubCategory === sub.name;
                return (
                  <TouchableOpacity
                    key={sub.id}
                    style={[styles.subCatChip, isSelected && styles.subCatChipActive]}
                    onPress={() => setSelectedSubCategory(sub.name)}
                  >
                    <Text style={[styles.subCatText, isSelected && styles.subCatTextActive]}>
                      {sub.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Step 3: Photos Picker */}
        <Text style={[styles.label, { marginTop: 16 }]}>২. ছবি যোগ করুন (সর্বোচ্চ ৮টি)</Text>
        <View style={styles.photosGrid}>
          {selectedPhotos.map((uri, idx) => (
            <View key={idx} style={styles.photoThumbWrap}>
              <Image source={{ uri }} style={styles.photoThumb} />
              <TouchableOpacity
                style={styles.removePhotoBtn}
                onPress={() => handleRemovePhoto(idx)}
              >
                <Ionicons name="close" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}

          {selectedPhotos.length < 8 && (
            <TouchableOpacity style={styles.addPhotoBtn} onPress={handlePickImages}>
              <Ionicons name="camera-outline" size={26} color={THEME.colors.primary} />
              <Text style={styles.addPhotoText}>ছবি যোগ করুন</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Step 4: Title & Description */}
        <Text style={[styles.label, { marginTop: 16 }]}>৩. বিজ্ঞাপনের শিরোনাম *</Text>
        <TextInput
          style={styles.input}
          placeholder="যেমন: iPhone 14 Pro 128GB ডিপ পার্পল ফ্রেশ কন্ডিশন"
          placeholderTextColor={THEME.colors.textMuted}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        <Text style={[styles.label, { marginTop: 14 }]}>৪. বিস্তারিত বিবরণ *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="পণ্যের অবস্থা, ব্যবহারের সময়কাল, সাথে কী কী আছে তা বিস্তারিত লিখুন..."
          placeholderTextColor={THEME.colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        {/* Step 5: Price and Condition */}
        <View style={styles.twoColRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>৫. মূল্য (৳ BDT) *</Text>
            <View style={styles.priceInputWrap}>
              <Text style={styles.currencySymbol}>{currencySymbol || (isEn ? "Tk" : "৳")}</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="যেমন: 25000"
                placeholderTextColor={THEME.colors.textMuted}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>
          </View>

          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>কন্ডিশন *</Text>
            <View style={styles.conditionRow}>
              <TouchableOpacity
                style={[
                  styles.conditionBtn,
                  condition === "Used" && styles.conditionBtnActive,
                ]}
                onPress={() => setCondition("Used")}
              >
                <Text
                  style={[
                    styles.conditionBtnText,
                    condition === "Used" && styles.conditionBtnTextActive,
                  ]}
                >
                  ব্যবহৃত (Used)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.conditionBtn,
                  condition === "New" && styles.conditionBtnActive,
                ]}
                onPress={() => setCondition("New")}
              >
                <Text
                  style={[
                    styles.conditionBtnText,
                    condition === "New" && styles.conditionBtnTextActive,
                  ]}
                >
                  নতুন (New)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Step 6: Location */}
        <Text style={[styles.label, { marginTop: 16 }]}>৬. আপনার অবস্থান (Location) *</Text>
        <View style={styles.locationSection}>
          {/* Division Picker */}
          <Text style={styles.subLabel}>বিভাগ (Division)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationScroll}>
            {BANGLADESH_DIVISIONS.map((div) => {
              const isSelected = state === div;
              return (
                <TouchableOpacity
                  key={div}
                  style={[styles.locChip, isSelected && styles.locChipActive]}
                  onPress={() => setState(div)}
                >
                  <Text style={[styles.locChipText, isSelected && styles.locChipTextActive]}>
                    {div.replace(" Division", "")}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* City / District Picker */}
          <Text style={[styles.subLabel, { marginTop: 10 }]}>শহর / জেলা (City)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationScroll}>
            {POPULAR_CITIES.filter((c) => c.id !== "all-bangladesh").map((c) => {
              const isSelected = city === c.name;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.locChip, isSelected && styles.locChipActive]}
                  onPress={() => setCity(c.name)}
                >
                  <Text style={[styles.locChipText, isSelected && styles.locChipTextActive]}>
                    {c.name} {c.nameBn ? `(${c.nameBn})` : ""}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={[styles.subLabel, { marginTop: 10 }]}>এলাকা / থানা / রোড</Text>
          <TextInput
            style={styles.input}
            placeholder="যেমন: মিরপুর ১০, উত্তরা সেক্টর ৪, জিইসি মোড়"
            placeholderTextColor={THEME.colors.textMuted}
            value={area}
            onChangeText={setArea}
          />
        </View>

        {/* Step 7: Contact Information */}
        <Text style={[styles.label, { marginTop: 16 }]}>৭. যোগাযোগের তথ্য</Text>
        <TextInput
          style={styles.input}
          placeholder="আপনার নাম"
          placeholderTextColor={THEME.colors.textMuted}
          value={contactName}
          onChangeText={setContactName}
        />
        <TextInput
          style={[styles.input, { marginTop: 8 }]}
          placeholder="মোবাইল নম্বর (যেমন: 017XXXXXXXX)"
          placeholderTextColor={THEME.colors.textMuted}
          keyboardType="phone-pad"
          value={contactPhone}
          onChangeText={setContactPhone}
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, (submitting || uploading) && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={submitting || uploading}
          activeOpacity={0.85}
        >
          {submitting || uploading ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.submitButtonText}>
                {uploading ? "ছবি আপলোড হচ্ছে..." : "বিজ্ঞাপন তৈরি হচ্ছে..."}
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>বিজ্ঞাপন প্রকাশ করুন (Submit Ad)</Text>
            </View>
          )}
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: THEME.colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  formContent: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.colors.text,
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.textSecondary,
    marginBottom: 6,
  },
  catScroll: {
    flexDirection: "row",
    marginBottom: 6,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.radii.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginRight: 8,
    gap: 6,
  },
  catChipActive: {
    backgroundColor: THEME.colors.primaryLight,
    borderColor: THEME.colors.primary,
  },
  catChipImg: {
    width: 20,
    height: 20,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.text,
  },
  catChipTextActive: {
    color: THEME.colors.primary,
    fontWeight: "700",
  },
  subCatScroll: {
    flexDirection: "row",
  },
  subCatChip: {
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.radii.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginRight: 8,
  },
  subCatChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  subCatText: {
    fontSize: 11,
    fontWeight: "500",
    color: THEME.colors.textSecondary,
  },
  subCatTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  photoThumbWrap: {
    width: 76,
    height: 76,
    borderRadius: THEME.radii.md,
    overflow: "hidden",
    position: "relative",
  },
  photoThumb: {
    width: "100%",
    height: "100%",
  },
  removePhotoBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoBtn: {
    width: 76,
    height: 76,
    borderRadius: THEME.radii.md,
    borderWidth: 1.5,
    borderColor: THEME.colors.primary,
    borderStyle: "dashed",
    backgroundColor: THEME.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  addPhotoText: {
    fontSize: 9,
    fontWeight: "700",
    color: THEME.colors.primary,
  },
  input: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radii.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: THEME.colors.text,
  },
  textArea: {
    height: 90,
    textAlignVertical: "top",
  },
  twoColRow: {
    flexDirection: "row",
    marginTop: 14,
  },
  priceInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radii.md,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.colors.primary,
    marginRight: 6,
  },
  priceInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: THEME.colors.text,
  },
  conditionRow: {
    flexDirection: "row",
    gap: 6,
    height: 44,
  },
  conditionBtn: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  conditionBtnActive: {
    backgroundColor: THEME.colors.primaryLight,
    borderColor: THEME.colors.primary,
  },
  conditionBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: THEME.colors.textSecondary,
  },
  conditionBtnTextActive: {
    color: THEME.colors.primary,
    fontWeight: "700",
  },
  locationSection: {
    backgroundColor: THEME.colors.surface,
    padding: 12,
    borderRadius: THEME.radii.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  locationScroll: {
    flexDirection: "row",
    marginBottom: 8,
  },
  locChip: {
    backgroundColor: THEME.colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.radii.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginRight: 6,
  },
  locChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  locChipText: {
    fontSize: 11,
    fontWeight: "500",
    color: THEME.colors.textSecondary,
  },
  locChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  submitButton: {
    backgroundColor: THEME.colors.accent,
    height: 50,
    borderRadius: THEME.radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    ...THEME.shadows.md,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  authPromptContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  authIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  authPromptTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.colors.text,
    marginBottom: 8,
  },
  authPromptSubtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  signInButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: THEME.radii.md,
    gap: 8,
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
