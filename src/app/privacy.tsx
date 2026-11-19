import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { THEME } from "../constants/theme";

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={THEME.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>গোপনীয়তা নীতি (Privacy Policy)</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>১. তথ্য সংগ্রহ (Information Collection)</Text>
        <Text style={styles.paragraph}>
          সেরা বন্ধু অ্যাপ ব্যবহার করার সময় আপনার নাম, মোবাইল নম্বর, ইমেইল এড্রেস এবং বিজ্ঞাপনের ছবি ও বিবরণ সংগ্রহ করা হয়।
        </Text>

        <Text style={styles.sectionTitle}>২. তথ্যের ব্যবহার (Use of Information)</Text>
        <Text style={styles.paragraph}>
          সংগৃহীত তথ্য ব্যবহারকারীর পরিচয় নিশ্চিত করতে, ইন-অ্যাপ মেসেঞ্জার পরিচালনা করতে এবং বিজ্ঞাপনের সঠিক উপস্থাপনায় ব্যবহৃত হয়।
        </Text>

        <Text style={styles.sectionTitle}>৩. চ্যাট ও ডেটা নিরাপত্তা (Data Security)</Text>
        <Text style={styles.paragraph}>
          ক্রেতা এবং বিক্রেতার মধ্যকার সমস্ত ইন-অ্যাপ বার্তা এনক্রিপ্ট করে আদান-প্রদান করা হয়। আমরা কখনো কোনো অননুমোদিত তৃতীয় পক্ষের কাছে আপনার ব্যক্তিগত তথ্য বিক্রি করি না।
        </Text>

        <Text style={styles.sectionTitle}>৪. অ্যাকাউন্ট বা তথ্য মুছে ফেলা (Account Deletion)</Text>
        <Text style={styles.paragraph}>
          যেকোনো সময় আপনার অ্যাকাউন্ট এবং সংশ্লিষ্ট তথ্য মুছে ফেলতে আমাদের সাপোর্ট টিমের সাথে support@serabondhu.net এ যোগাযোগ করতে পারেন।
        </Text>
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
