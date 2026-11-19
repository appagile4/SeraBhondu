import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { THEME } from "../../constants/theme";
import { useLanguage } from "../../hooks/useLanguage";

export type LegalModalType = "terms" | "privacy" | "safety";

interface LegalModalProps {
  visible: boolean;
  type: LegalModalType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  visible,
  type,
  onClose,
}) => {
  const { isBn } = useLanguage();

  const getTitle = () => {
    switch (type) {
      case "terms":
        return isBn ? "ব্যবহারের শর্তাবলী" : "Terms of Use";
      case "privacy":
        return isBn ? "গোপনীয়তা নীতি" : "Privacy Policy";
      case "safety":
        return isBn ? "নিরাপত্তা নির্দেশিকা" : "Safety Guidelines";
    }
  };

  const renderContent = () => {
    switch (type) {
      case "terms":
        return (
          <View style={styles.textContent}>
            <Text style={styles.sectionHeader}>1. Acceptance of Terms</Text>
            <Text style={styles.paragraph}>
              By accessing or using Serabondhu (serabondhu.net), you agree to be bound by these Terms of Use and all applicable laws and regulations of Bangladesh.
            </Text>

            <Text style={styles.sectionHeader}>2. Marketplace Rules & Prohibited Items</Text>
            <Text style={styles.paragraph}>
              Serabondhu is a local community marketplace. You agree not to post illegal, counterfeit, stolen, hazardous, or prohibited goods according to Bangladesh laws.
            </Text>

            <Text style={styles.sectionHeader}>3. User Accounts & Verification</Text>
            <Text style={styles.paragraph}>
              You are responsible for maintaining the confidentiality of your account credentials and OTP codes. You agree to notify Serabondhu immediately of any unauthorized use.
            </Text>

            <Text style={styles.sectionHeader}>4. Content Ownership & Rights</Text>
            <Text style={styles.paragraph}>
              You retain ownership of the photos, descriptions, and advertisements you post. However, you grant Serabondhu a non-exclusive license to host, display, and promote your classified listings.
            </Text>

            <Text style={styles.sectionHeader}>5. Limitation of Liability</Text>
            <Text style={styles.paragraph}>
              Serabondhu facilitates connections between buyers and sellers. We do not inspect items in person or guarantee product quality. Always inspect goods prior to payment.
            </Text>
          </View>
        );

      case "privacy":
        return (
          <View style={styles.textContent}>
            <Text style={styles.sectionHeader}>1. Information We Collect</Text>
            <Text style={styles.paragraph}>
              We collect information you provide directly to us when creating an account, posting an ad, or sending a chat message (name, email, phone number, location, and photos).
            </Text>

            <Text style={styles.sectionHeader}>2. How We Use Your Information</Text>
            <Text style={styles.paragraph}>
              Your information is used to facilitate buyer-seller communications, verify accounts, prevent fraud, and deliver relevant advertisements across Bangladesh divisions.
            </Text>

            <Text style={styles.sectionHeader}>3. Security & In-App Chat</Text>
            <Text style={styles.paragraph}>
              All in-app messages are secured and transmitted via TLS encryption. We do not sell your personal data or phone number to unauthorized third-party advertisers.
            </Text>

            <Text style={styles.sectionHeader}>4. Data Retention & Deletion</Text>
            <Text style={styles.paragraph}>
              You may request deletion of your account and personal data at any time by contacting support at support@serabondhu.net.
            </Text>
          </View>
        );

      case "safety":
        return (
          <View style={styles.textContent}>
            <View style={styles.safetyBox}>
              <Ionicons name="shield-checkmark" size={24} color={THEME.colors.primary} />
              <Text style={styles.safetyBoxText}>
                Stay safe when buying and selling on Serabondhu across Bangladesh.
              </Text>
            </View>

            <Text style={styles.sectionHeader}>১. নিরাপদ স্থানে সাক্ষাৎ করুন (Meet in Public)</Text>
            <Text style={styles.paragraph}>
              Always meet in a well-lit, busy public place such as shopping malls, metro stations, or popular markets. Never invite strangers to private residences alone.
            </Text>

            <Text style={styles.sectionHeader}>২. পণ্য যাচাই করে টাকা দিন (Inspect First)</Text>
            <Text style={styles.paragraph}>
              Carefully inspect the item, check IMEI numbers for smartphones, test electronics, and verify vehicle registration documents before making any cash or mobile banking payments.
            </Text>

            <Text style={styles.sectionHeader}>৩. অগ্রিম টাকা পাঠানো থেকে বিরত থাকুন (No Advance Payment)</Text>
            <Text style={styles.paragraph}>
              Never send advance bKash, Nagad, Rocket, or bank payments to unknown sellers before seeing and verifying the product in person.
            </Text>

            <Text style={styles.sectionHeader}>৪. ওটিপি বা পাসওয়ার্ড শেয়ার করবেন না (Keep OTP Secret)</Text>
            <Text style={styles.paragraph}>
              Serabondhu representatives will NEVER call or message you asking for your login OTP or password. Never share verification codes with anyone.
            </Text>
          </View>
        );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{getTitle()}</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color={THEME.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.colors.text,
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 20,
    paddingBottom: 40,
  },
  textContent: {},
  sectionHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.colors.text,
    marginTop: 18,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 20,
  },
  safetyBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.primaryLight,
    padding: 14,
    borderRadius: THEME.radii.md,
    marginBottom: 16,
    gap: 12,
  },
  safetyBoxText: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.colors.primary,
    flex: 1,
  },
});
