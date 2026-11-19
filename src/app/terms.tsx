import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { THEME } from "../constants/theme";
import { useLanguage } from "../hooks/useLanguage";

export default function TermsScreen() {
  const router = useRouter();
  const { isBn } = useLanguage();

  const SECTIONS = [
    {
      title: isBn ? "১. সাধারণ নিয়মাবলী" : "1. Acceptance of Terms",
      desc: isBn
        ? "সেরা বন্ধু (Serabondhu) মোবাইল অ্যাপ ব্যবহারের মাধ্যমে আপনি আমাদের সকল নিয়ম ও বাংলাদেশের প্রচলিত আইন মেনে চলতে অঙ্গীকারবদ্ধ।"
        : "By accessing or using the Serabondhu mobile app, you agree to be bound by these Terms of Use and comply with all applicable laws and regulations of Bangladesh.",
    },
    {
      title: isBn ? "২. বিজ্ঞাপনের সত্যতা ও নিয়ম" : "2. Ad Authenticity & Rules",
      desc: isBn
        ? "বিজ্ঞাপনদাতার পণ্যের বিবরণ এবং ছবি বাস্তব ও সত্য হতে হবে। কোনো বিভ্রান্তিকর বা ভুয়া তথ্য প্রদান করা সম্পূর্ণ নিষিদ্ধ।"
        : "All product descriptions, specifications, and images posted by advertisers must be truthful and accurate. Misleading, counterfeit, or fraudulent content is strictly prohibited.",
    },
    {
      title: isBn ? "৩. নিষিদ্ধ পণ্য ও সেবা" : "3. Prohibited Goods & Services",
      desc: isBn
        ? "অস্ত্র, মাদকদ্রব্য, চোরাই মাল, পাইরেটেড সফটওয়্যার, জাল কাগজপত্র বা কোনো অবৈধ সামগ্রীর বিজ্ঞাপন দেওয়া সম্পূর্ণ নিষিদ্ধ।"
        : "Weapons, narcotics, stolen property, pirated software, forged documents, and any goods or services deemed illegal under the laws of Bangladesh are strictly forbidden.",
    },
    {
      title: isBn ? "৪. দায়বদ্ধতার সীমাবদ্ধতা" : "4. Limitation of Liability",
      desc: isBn
        ? "সেরা বন্ধু কেবল ক্রেতা এবং বিক্রেতার মধ্যে যোগাযোগের মাধ্যম হিসেবে কাজ করে। পণ্য কেনাবেচার সময় ক্রেতা-বিক্রেতার ব্যক্তিগত কোনো আর্থিক বা শারীরিক ক্ষতির দায় সেরা বন্ধু বহন করবে না।"
        : "Serabondhu operates solely as a community marketplace connecting buyers and sellers. We do not inspect products in person or guarantee item quality. Users bear full responsibility for inspecting items before purchase.",
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={THEME.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isBn ? "ব্যবহারের শর্তাবলী" : "Terms of Use"}</Text>
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
