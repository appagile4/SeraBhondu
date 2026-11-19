import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { deleteAccountThunk } from "../store/slices/authSlice";
import { authApi } from "../services/api";
import { THEME } from "../constants/theme";
import { useLanguage } from "../hooks/useLanguage";

const REASONS = [
  { id: "found_item", en: "I have found what I was looking for", bn: "যা খুঁজছিলাম তা পেয়ে গেছি" },
  { id: "privacy", en: "I have privacy or security concerns", bn: "প্রাইভেসি বা নিরাপত্তা সংক্রান্ত উদ্বেগ" },
  { id: "notifications", en: "I receive too many messages or notifications", bn: "অতিরিক্ত বার্তা বা নোটিফিকেশন পাচ্ছি" },
  { id: "switch_account", en: "I am switching to another account", bn: "অন্য অ্যাকাউন্টে স্থানান্তরিত হচ্ছি" },
  { id: "technical", en: "I encountered technical issues or bugs", bn: "কারিগরি সমস্যা বা ত্রুটির সম্মুখীন হয়েছি" },
  { id: "other", en: "Other reason", bn: "অন্যান্য কারণ" },
];

export default function DeleteAccountScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { t, isBn } = useLanguage();

  const [email, setEmail] = useState(user?.email || "");
  const [selectedReason, setSelectedReason] = useState("");
  const [reasonDetails, setReasonDetails] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Sync user email if available
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Request OTP
  const handleSendOtp = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      Alert.alert(
        isBn ? "ত্রুটি" : "Error",
        isBn ? "অনুগ্রহ করে আপনার সঠিক ইমেইল ঠিকানা লিখুন।" : "Please enter a valid registered email address."
      );
      return;
    }

    if (!selectedReason) {
      Alert.alert(
        isBn ? "কারণ নির্বাচন করুন" : "Reason Required",
        isBn ? "অনুগ্রহ করে অ্যাকাউন্ট মুছে ফেলার একটি কারণ নির্বাচন করুন।" : "Please select a reason for deleting your account."
      );
      return;
    }

    setIsSendingOtp(true);
    try {
      await authApi.requestDeleteAccountOtp(cleanEmail);
      setOtpSent(true);
      setCountdown(60);
      Alert.alert(
        isBn ? "কোড পাঠানো হয়েছে" : "Code Sent",
        isBn
          ? `আপনার ${cleanEmail} ইমেইলে একটি ৬-সংখ্যার যাচাইকরণ কোড পাঠানো হয়েছে। এটি ৫ মিনিট কার্যকর থাকবে।`
          : `A 6-digit verification code has been sent to ${cleanEmail}. It is valid for 5 minutes.`
      );
    } catch (err: any) {
      Alert.alert(
        isBn ? "ব্যর্থ হয়েছে" : "Request Failed",
        err.response?.data?.message || err.message || (isBn ? "কোড পাঠাতে সমস্যা হয়েছে।" : "Unable to send verification code.")
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Execute Deletion
  const handleDeleteAccount = () => {
    if (!isConfirmed) {
      Alert.alert(
        isBn ? "শর্ত মেনে নিন" : "Confirmation Required",
        isBn
          ? "অনুগ্রহ করে নিশ্চিত করুন যে আপনি অবগত অ্যাকাউন্ট মুছে ফেলার প্রক্রিয়াটি অপরিবর্তনীয়।"
          : "Please confirm that you understand this action is permanent and cannot be undone."
      );
      return;
    }

    if (!selectedReason) {
      Alert.alert(
        isBn ? "কারণ প্রয়োজন" : "Reason Required",
        isBn ? "অনুগ্রহ করে একটি কারণ নির্বাচন করুন।" : "Please choose a reason."
      );
      return;
    }

    // If OTP flow was triggered or user provided email
    if (otpSent && (!otp.trim() || otp.trim().length !== 6)) {
      Alert.alert(
        isBn ? "যাচাইকরণ কোড প্রয়োজন" : "Verification Code Required",
        isBn ? "অনুগ্রহ করে ইমেইলে প্রাপ্ত ৬-সংখ্যার কোডটি লিখুন।" : "Please enter the 6-digit code received via email."
      );
      return;
    }

    Alert.alert(
      isBn ? "চূড়ান্ত সতর্কতা" : "Final Warning",
      isBn
        ? "আপনি কি নিশ্চিতভাবে আপনার অ্যাকাউন্টটি চিরতরে মুছে ফেলতে চান? আপনার সমস্ত বিজ্ঞাপন, বার্তা ও তথ্য মুছে যাবে।"
        : "Are you absolutely sure you want to permanently delete your account? All your listings, messages, and saved data will be erased forever.",
      [
        { text: isBn ? "বাতিল" : "Cancel", style: "cancel" },
        {
          text: isBn ? "হ্যাঁ, মুছে ফেলুন" : "Yes, Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              const reasonText = REASONS.find((r) => r.id === selectedReason)?.en || selectedReason;
              await dispatch(
                deleteAccountThunk({
                  email: email.trim().toLowerCase(),
                  otp: otp.trim() || undefined,
                  reason: reasonText,
                  reasonDetails: reasonDetails.trim() || undefined,
                })
              ).unwrap();

              Alert.alert(
                isBn ? "অ্যাকাউন্ট অপসারিত" : "Account Deleted",
                t("deleteAccountSuccess"),
                [
                  {
                    text: isBn ? "ঠিক আছে" : "OK",
                    onPress: () => router.replace("/(tabs)" as any),
                  },
                ]
              );
            } catch (err: any) {
              Alert.alert(
                isBn ? "ত্রুটি" : "Error",
                err || (isBn ? "অ্যাকাউন্ট মুছে ফেলা সম্ভব হয়নি।" : "Failed to delete account. Please try again.")
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={THEME.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("deleteAccount")}</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Warning Banner */}
          <View style={styles.warningCard}>
            <View style={styles.warningHeader}>
              <Ionicons name="warning" size={24} color="#DC2626" />
              <Text style={styles.warningTitle}>
                {isBn ? "অ্যাকশনটি স্থায়ী ও অপরিবর্তনীয়" : "Permanent Action"}
              </Text>
            </View>
            <Text style={styles.warningDesc}>{t("deleteAccountWarning")}</Text>

            {/* What gets deleted list */}
            <View style={styles.erasedItemsRow}>
              <View style={styles.erasedPill}>
                <Ionicons name="trash-bin-outline" size={14} color="#DC2626" />
                <Text style={styles.erasedText}>{isBn ? "সকল বিজ্ঞাপন" : "All Listings"}</Text>
              </View>
              <View style={styles.erasedPill}>
                <Ionicons name="chatbubbles-outline" size={14} color="#DC2626" />
                <Text style={styles.erasedText}>{isBn ? "সকল মেসেজ" : "All Chats"}</Text>
              </View>
              <View style={styles.erasedPill}>
                <Ionicons name="heart-dislike-outline" size={14} color="#DC2626" />
                <Text style={styles.erasedText}>{isBn ? "প্রোফাইল তথ্য" : "Profile Data"}</Text>
              </View>
            </View>
          </View>

          {/* User Account Info */}
          {user && (
            <View style={styles.userCard}>
              <Ionicons name="person-circle-outline" size={36} color={THEME.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.userNameText}>{user.name}</Text>
                <Text style={styles.userEmailText}>{user.email || user.phone || ""}</Text>
              </View>
            </View>
          )}

          {/* Email input if not authenticated or different */}
          {!user?.email && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                {isBn ? "নিবন্ধিত ইমেইল ঠিকানা" : "Registered Email"} *
              </Text>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="youremail@example.com"
                placeholderTextColor={THEME.colors.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          )}

          {/* Reason Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t("reasonLeaving")} *</Text>
            <View style={styles.reasonsList}>
              {REASONS.map((item) => {
                const isSelected = selectedReason === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.reasonOption, isSelected && styles.reasonOptionSelected]}
                    onPress={() => setSelectedReason(item.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isSelected ? "radio-button-on" : "radio-button-off"}
                      size={18}
                      color={isSelected ? "#DC2626" : THEME.colors.textMuted}
                    />
                    <Text style={[styles.reasonText, isSelected && styles.reasonTextSelected]}>
                      {isBn ? item.bn : item.en}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Detailed Feedback (Optional) */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {isBn ? "মতামত বা পরামর্শ (ঐচ্ছিক)" : "Additional Feedback (Optional)"}
            </Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={reasonDetails}
              onChangeText={setReasonDetails}
              placeholder={isBn ? "আপনার মতামত আমাদের সেবার মান উন্নত করতে সাহায্য করবে..." : "Help us understand how we can improve..."}
              placeholderTextColor={THEME.colors.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Email OTP Verification Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {isBn ? "নিরাপত্তা কোড দিয়ে যাচাইকরণ" : "Security Verification Code"}
            </Text>
            {!otpSent ? (
              <TouchableOpacity
                style={styles.sendOtpBtn}
                onPress={handleSendOtp}
                disabled={isSendingOtp}
                activeOpacity={0.8}
              >
                {isSendingOtp ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="mail-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.sendOtpBtnText}>
                      {isBn ? "ইমেইলে যাচাইকরণ কোড পাঠান" : "Send Verification Code"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.otpBox}>
                <View style={styles.otpInputRow}>
                  <TextInput
                    style={styles.otpInput}
                    value={otp}
                    onChangeText={(val) => setOtp(val.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    placeholderTextColor={THEME.colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <TouchableOpacity
                    style={[styles.resendBtn, countdown > 0 && { opacity: 0.5 }]}
                    onPress={handleSendOtp}
                    disabled={countdown > 0 || isSendingOtp}
                  >
                    <Text style={styles.resendBtnText}>
                      {countdown > 0 ? `${countdown}s` : (isBn ? "পুনরায় পাঠান" : "Resend")}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.otpNotice}>
                  {isBn
                    ? `যাচাইকরণ কোড ${email}-এ পাঠানো হয়েছে। ৫ মিনিট কার্যকর থাকবে।`
                    : `Code sent to ${email}. Valid for 5 minutes.`}
                </Text>
              </View>
            )}
          </View>

          {/* Confirmation Checkbox */}
          <TouchableOpacity
            style={styles.confirmRow}
            onPress={() => setIsConfirmed(!isConfirmed)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isConfirmed ? "checkbox" : "square-outline"}
              size={22}
              color={isConfirmed ? "#DC2626" : THEME.colors.textMuted}
            />
            <Text style={styles.confirmText}>
              {isBn
                ? "আমি অবগত যে আমার অ্যাকাউন্ট এবং সমস্ত সংশ্লিষ্ট ডেটা স্থায়ীভাবে মুছে যাবে এবং পুনরুদ্ধার করা যাবে না।"
                : "I understand that my account and all associated data will be permanently deleted and cannot be recovered."}
            </Text>
          </TouchableOpacity>

          {/* Delete Action Button */}
          <TouchableOpacity
            style={[
              styles.deleteBtn,
              (!isConfirmed || isDeleting) && styles.deleteBtnDisabled,
            ]}
            onPress={handleDeleteAccount}
            disabled={!isConfirmed || isDeleting}
            activeOpacity={0.85}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                <Text style={styles.deleteBtnText}>{t("deleteAccountTitle")}</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Cancel button */}
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
            disabled={isDeleting}
          >
            <Text style={styles.cancelBtnText}>{isBn ? "বাতিল করুন" : "Cancel"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: THEME.colors.text,
  },
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  warningCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: 16,
    marginBottom: 16,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#DC2626",
  },
  warningDesc: {
    fontSize: 12,
    color: "#991B1B",
    lineHeight: 18,
    marginBottom: 12,
  },
  erasedItemsRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  erasedPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    gap: 4,
  },
  erasedText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#DC2626",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 12,
    marginBottom: 16,
  },
  userNameText: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.colors.text,
  },
  userEmailText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.colors.text,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: THEME.colors.text,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  reasonsList: {
    gap: 6,
  },
  reasonOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 10,
  },
  reasonOptionSelected: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  reasonText: {
    fontSize: 13,
    color: THEME.colors.text,
    flex: 1,
  },
  reasonTextSelected: {
    fontWeight: "700",
    color: "#DC2626",
  },
  sendOtpBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC2626",
    borderRadius: 10,
    paddingVertical: 12,
    gap: 8,
  },
  sendOtpBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  otpBox: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 12,
  },
  otpInputRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  otpInput: {
    flex: 1,
    fontSize: 18,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontWeight: "800",
    letterSpacing: 6,
    textAlign: "center",
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 8,
    backgroundColor: THEME.colors.background,
    color: THEME.colors.text,
  },
  resendBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  resendBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#DC2626",
  },
  otpNotice: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 8,
  },
  confirmRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginVertical: 16,
  },
  confirmText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteBtnDisabled: {
    opacity: 0.45,
  },
  deleteBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.colors.textSecondary,
  },
});
