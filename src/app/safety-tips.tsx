import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { THEME } from "../constants/theme";

export default function SafetyTipsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={THEME.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>নিরাপত্তা গাইড (Safety Tips)</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.heroBox}>
          <Ionicons name="shield-checkmark" size={32} color={THEME.colors.primary} />
          <Text style={styles.heroTitle}>সেরা বন্ধুতে নিরাপদ কেনাবেচা</Text>
          <Text style={styles.heroSubtitle}>
            আমাদের প্রধান অগ্রাধিকার আপনার নিরাপত্তা। প্রতারণা এড়াতে নিচের নির্দেশনাবলী অনুসরণ করুন।
          </Text>
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipIconWrap}>
            <Ionicons name="people" size={20} color={THEME.colors.primary} />
          </View>
          <View style={styles.tipInfo}>
            <Text style={styles.tipTitle}>১. জনবহুল স্থানে দেখা করুন</Text>
            <Text style={styles.tipDesc}>
              সরাসরি লেনদেনের জন্য শপিং মল, বাস টার্মিনাল, মেট্রোরেল স্টেশন বা পরিচিত পাবলিক প্লেসে দেখা করুন। কোনো নির্জন স্থানে যাবেন না।
            </Text>
          </View>
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipIconWrap}>
            <Ionicons name="search" size={20} color={THEME.colors.primary} />
          </View>
          <View style={styles.tipInfo}>
            <Text style={styles.tipTitle}>২. পণ্য যাচাই করে টাকা দিন</Text>
            <Text style={styles.tipDesc}>
              মোবাইল ফোনের IMEI, ইলেকট্রনিক পণ্যের ওয়ারেন্টি ও ফাংশন, গাড়ির কাগজপত্র ভালো করে যাচাই করার পর পেমেন্ট করুন।
            </Text>
          </View>
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipIconWrap}>
            <Ionicons name="cash-outline" size={20} color={THEME.colors.accent} />
          </View>
          <View style={styles.tipInfo}>
            <Text style={styles.tipTitle}>৩. কোনো অগ্রিম টাকা পাঠাবেন না</Text>
            <Text style={styles.tipDesc}>
              ডেলিভারি চার্জ বা বুকিং মানির নামে বিকাশ/নগদ/রকেটে কোনো অগ্রিম টাকা চাওয়া হলে তা পাঠাবেন না।
            </Text>
          </View>
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipIconWrap}>
            <Ionicons name="keypad" size={20} color={THEME.colors.primary} />
          </View>
          <View style={styles.tipInfo}>
            <Text style={styles.tipTitle}>৪. ওটিপি বা পিন গোপন রাখুন</Text>
            <Text style={styles.tipDesc}>
              সেরা বন্ধু কর্তৃপক্ষ কখনোই আপনার ওটিপি (OTP), পাসওয়ার্ড বা বিকাশ/নগদ পিন চাইবে না।
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  heroBox: {
    backgroundColor: THEME.colors.primaryLight,
    padding: 20,
    borderRadius: THEME.radii.lg,
    alignItems: "center",
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: THEME.colors.primary,
    marginTop: 10,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: "center",
    lineHeight: 19,
  },
  tipCard: {
    flexDirection: "row",
    backgroundColor: THEME.colors.surface,
    padding: 16,
    borderRadius: THEME.radii.lg,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.sm,
  },
  tipIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  tipInfo: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.colors.text,
    marginBottom: 4,
  },
  tipDesc: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },
});
