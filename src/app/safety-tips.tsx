import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { THEME } from "../constants/theme";
import { useLanguage } from "../hooks/useLanguage";

export default function SafetyTipsScreen() {
  const router = useRouter();
  const { isBn, t } = useLanguage();

  const TIPS = [
    {
      icon: "people" as const,
      color: THEME.colors.primary,
      title: isBn ? "১. জনবহুল স্থানে দেখা করুন" : "1. Meet in Busy Public Places",
      desc: isBn
        ? "সরাসরি লেনদেনের জন্য শপিং মল, বাস টার্মিনাল, মেট্রোরেল স্টেশন বা পরিচিত পাবলিক প্লেসে দেখা করুন। কোনো নির্জন স্থানে যাবেন না।"
        : "Always arrange physical meetings in bustling, well-lit public places such as shopping malls, metro stations, or popular markets. Never meet in secluded areas or private residences alone.",
    },
    {
      icon: "search" as const,
      color: THEME.colors.primary,
      title: isBn ? "২. পণ্য যাচাই করে টাকা দিন" : "2. Inspect the Item In-Person Before Paying",
      desc: isBn
        ? "মোবাইল ফোনের IMEI, ইলেকট্রনিক পণ্যের ওয়ারেন্টি ও ফাংশন, গাড়ির কাগজপত্র ভালো করে যাচাই করার পর পেমেন্ট করুন।"
        : "Carefully inspect the item, check smartphone IMEI numbers, test electronic functions, and verify registration documents before making payment.",
    },
    {
      icon: "cash-outline" as const,
      color: THEME.colors.accent,
      title: isBn ? "৩. কোনো অগ্রিম টাকা পাঠাবেন না" : "3. Never Send Advance Payments",
      desc: isBn
        ? "ডেলিভারি চার্জ বা বুকিং মানির নামে বিকাশ/নগদ/রকেটে কোনো অগ্রিম টাকা চাওয়া হলে তা পাঠাবেন না।"
        : "Never send advance payments via bKash, Nagad, Rocket, or bank transfer for delivery charges, booking fees, or reservations before verifying the product in person.",
    },
    {
      icon: "keypad" as const,
      color: THEME.colors.primary,
      title: isBn ? "৪. ওটিপি বা পিন গোপন রাখুন" : "4. Keep Your OTP and PIN Secret",
      desc: isBn
        ? "সেরা বন্ধু কর্তৃপক্ষ কখনোই আপনার ওটিপি (OTP), পাসওয়ার্ড বা বিকাশ/নগদ পিন চাইবে না। এগুলো কারো সাথে শেয়ার করবেন না।"
        : "Serabondhu staff will never ask for your login OTP, password, or mobile banking PIN. Never share verification codes with anyone.",
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={THEME.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isBn ? "নিরাপত্তা নির্দেশিকা" : "Safety Guidelines"}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.heroBox}>
          <Ionicons name="shield-checkmark" size={32} color={THEME.colors.primary} />
          <Text style={styles.heroTitle}>
            {isBn ? "সেরা বন্ধুতে নিরাপদ কেনাবেচা" : "Safe Trading on Serabondhu"}
          </Text>
          <Text style={styles.heroSubtitle}>
            {isBn
              ? "আমাদের প্রধান অগ্রাধিকার আপনার নিরাপত্তা। প্রতারণা এড়াতে নিচের নির্দেশনাবলী অনুসরণ করুন।"
              : "Your safety is our top priority. Follow these guidelines to trade safely and avoid fraud."}
          </Text>
        </View>

        {TIPS.map((tip, idx) => (
          <View key={idx} style={styles.tipCard}>
            <View style={styles.tipIconWrap}>
              <Ionicons name={tip.icon} size={20} color={tip.color} />
            </View>
            <View style={styles.tipInfo}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDesc}>{tip.desc}</Text>
            </View>
          </View>
        ))}
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
