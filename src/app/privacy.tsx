import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { THEME } from "../constants/theme";
import { useLanguage } from "../hooks/useLanguage";

export default function PrivacyScreen() {
  const router = useRouter();
  const { isBn } = useLanguage();

  const SECTIONS = [
    {
      title: isBn ? "১. সংগৃহীত তথ্যাবলী" : "1. Information We Collect",
      desc: isBn
        ? "সেরা বন্ধু অ্যাপ ব্যবহার করার সময় আপনার নাম, মোবাইল নম্বর, ইমেইল এড্রেস এবং বিজ্ঞাপনের ছবি ও বিবরণ সংগ্রহ করা হয়।"
        : "When you use the Serabondhu app, we collect personal information you provide directly, including your name, mobile number, email address, location, and advertisement photos and details.",
    },
    {
      title: isBn ? "২. তথ্যের ব্যবহার" : "2. How We Use Information",
      desc: isBn
        ? "সংগৃহীত তথ্য ব্যবহারকারীর পরিচয় নিশ্চিত করতে, ইন-অ্যাপ মেসেঞ্জার পরিচালনা করতে এবং বিজ্ঞাপনের সঠিক উপস্থাপনায় ব্যবহৃত হয়।"
        : "Collected information is used to authenticate user accounts, facilitate secure buyer-seller in-app messaging, prevent fraud, and provide localized marketplace search results.",
    },
    {
      title: isBn ? "৩. চ্যাট ও ডেটা নিরাপত্তা" : "3. Data Security & Encryption",
      desc: isBn
        ? "ক্রেতা এবং বিক্রেতার মধ্যকার সমস্ত ইন-অ্যাপ বার্তা এনক্রিপ্ট করে আদান-প্রদান করা হয়। আমরা কখনো কোনো অননুমোদিত তৃতীয় পক্ষের কাছে আপনার ব্যক্তিগত তথ্য বিক্রি করি না।"
        : "All in-app messages between buyers and sellers are transmitted using secure encryption. We strictly protect user privacy and never sell personal information to unauthorized third parties.",
    },
    {
      title: isBn ? "৪. অ্যাকাউন্ট বা তথ্য মুছে ফেলা" : "4. Account Deletion & Rights",
      desc: isBn
        ? "যেকোনো সময় অ্যাপের অ্যাকাউন্ট সেটিংস থেকে সরাসরি আপনার অ্যাকাউন্ট ও সংশ্লিষ্ট সমস্ত তথ্য চিরতরে মুছে ফেলতে পারেন অথবা support@serabondhu.net এ যোগাযোগ করতে পারেন।"
        : "You may permanently delete your account and all associated personal data at any time directly through the app settings or by contacting our team at support@serabondhu.net.",
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={THEME.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isBn ? "গোপনীয়তা নীতি" : "Privacy Policy"}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {SECTIONS.map((sec, idx) => (
          <View key={idx}>
            <Text style={styles.sectionTitle}>{sec.title}</Text>
            <Text style={styles.paragraph}>{sec.desc}</Text>
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
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.colors.text,
    marginTop: 16,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 20,
  },
});
