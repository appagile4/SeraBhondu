import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchMyAds, deleteMyAd, setStatusFilter } from "../store/slices/myAdsSlice";
import { AdvertisementItem } from "../store/slices/listingsSlice";
import { listingsApi } from "../services/api";
import { THEME } from "../constants/theme";
import { useLanguage } from "../hooks/useLanguage";

const STATUS_TABS = [
  { key: "all", label: "সকল (All)" },
  { key: "approved", label: "সক্রিয় (Active)" },
  { key: "pending", label: "অপেক্ষমান (Pending)" },
  { key: "rejected", label: "বাতিল (Rejected)" },
  { key: "sold", label: "বিক্রিত (Sold)" },
] as const;

export default function MyAdsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isEn, currencySymbol } = useLanguage();
  const sym = currencySymbol || (isEn ? "₹" : "৳");
  const { ads, activeStatusFilter, isLoading, isRefreshing } = useAppSelector(
    (state) => state.myAds
  );

  useEffect(() => {
    dispatch(fetchMyAds());
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(fetchMyAds(true));
  };

  const filteredAds = ads.filter((ad) => {
    if (activeStatusFilter === "all") return true;
    return ad.status === activeStatusFilter;
  });

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      "বিজ্ঞাপন মুছে ফেলুন",
      `আপনি কি নিশ্চিত "${title}" বিজ্ঞাপনটি স্থায়ীভাবে মুছে ফেলতে চান?`,
      [
        { text: "বাতিল", style: "cancel" },
        {
          text: "মুছে ফেলুন",
          style: "destructive",
          onPress: () => dispatch(deleteMyAd(id)),
        },
      ]
    );
  };

  const handleMarkAsSold = async (ad: AdvertisementItem) => {
    try {
      await listingsApi.update(ad._id, { status: "sold", isSold: true });
      dispatch(fetchMyAds(true));
      Alert.alert("বিক্রিত হিসেবে চিহ্নিত", "বিজ্ঞাপনটি সফলভাবে বিক্রিত হিসেবে চিহ্নিত করা হয়েছে।");
    } catch (err: any) {
      Alert.alert("ত্রুটি", "বিজ্ঞাপনটি বিক্রিত চিহ্নিত করা যায়নি।");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return {
          label: "সক্রিয় ও প্রকাশিত",
          bg: THEME.colors.successLight,
          color: THEME.colors.success,
          icon: "checkmark-circle",
        };
      case "pending":
        return {
          label: "অনুমোদনের অপেক্ষায়",
          bg: THEME.colors.warningLight,
          color: THEME.colors.warning,
          icon: "time-outline",
        };
      case "rejected":
        return {
          label: "অননুমোদিত / বাতিল",
          bg: THEME.colors.dangerLight,
          color: THEME.colors.danger,
          icon: "close-circle",
        };
      case "sold":
        return {
          label: "বিক্রিত (Sold)",
          bg: "#F1F5F9",
          color: THEME.colors.textMuted,
          icon: "checkmark-done-circle",
        };
      default:
        return {
          label: status,
          bg: "#F1F5F9",
          color: THEME.colors.textMuted,
          icon: "help-circle-outline",
        };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={THEME.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>আমার বিজ্ঞাপন সমূহ (My Ads)</Text>
        <TouchableOpacity
          style={styles.postNewBtn}
          onPress={() => router.push("/(tabs)/post-ad" as any)}
        >
          <Ionicons name="add" size={20} color={THEME.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* Status Filter Horizontal Tabs */}
        <View style={styles.tabsWrap}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_TABS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.tabsScroll}
          renderItem={({ item }) => {
            const isActive = activeStatusFilter === item.key;
            return (
              <TouchableOpacity
                style={[styles.statusTab, isActive && styles.statusTabActive]}
                onPress={() => dispatch(setStatusFilter(item.key as any))}
              >
                <Text style={[styles.statusTabText, isActive && styles.statusTabTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Ads List */}
      <FlatList
        data={filteredAds}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[THEME.colors.primary]}
            tintColor={THEME.colors.primary}
          />
        }
        renderItem={({ item }) => {
          const badge = getStatusBadge(item.status);
          const imgUrl =
            item.images?.[0]?.url ||
            "https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&w=300&q=80";

          return (
            <View style={styles.adCard}>
              <View style={styles.adTop}>
                <Image source={{ uri: imgUrl }} style={styles.adThumb} />
                <View style={styles.adInfo}>
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Ionicons name={badge.icon as any} size={12} color={badge.color} />
                    <Text style={[styles.statusBadgeText, { color: badge.color }]}>
                      {badge.label}
                    </Text>
                  </View>

                  <Text style={styles.adTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.adPrice}>
                    {sym} {Number(item.price).toLocaleString("en-BD")}
                  </Text>
                  <Text style={styles.adDate}>
                    {new Date(item.createdAt).toLocaleDateString("bn-BD")}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.actionBtnSecondary}
                  onPress={() => {
                    router.push({
                      pathname: "/listing/[slug]",
                      params: { slug: item.slug },
                    } as any);
                  }}
                >
                  <Ionicons name="eye-outline" size={15} color={THEME.colors.text} />
                  <Text style={styles.actionBtnText}>দেখুন (View)</Text>
                </TouchableOpacity>

                {item.status === "approved" && (
                  <TouchableOpacity
                    style={styles.actionBtnSecondary}
                    onPress={() => handleMarkAsSold(item)}
                  >
                    <Ionicons name="checkmark-done" size={15} color={THEME.colors.primary} />
                    <Text style={[styles.actionBtnText, { color: THEME.colors.primary }]}>
                      বিক্রিত চিহ্নিত করুন
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.actionBtnDelete}
                  onPress={() => handleDelete(item._id, item.title)}
                >
                  <Ionicons name="trash-outline" size={15} color={THEME.colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={48} color={THEME.colors.textMuted} />
              <Text style={styles.emptyTitle}>কোনো বিজ্ঞাপন নেই</Text>
              <Text style={styles.emptySubtitle}>
                আপনি এখনো কোনো বিজ্ঞাপন পোস্ট করেননি। নতুন বিজ্ঞাপন দিতে নিচের বাটনে ট্যাপ করুন।
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => router.push("/(tabs)/post-ad" as any)}
              >
                <Text style={styles.emptyBtnText}>বিজ্ঞাপন দিন (Post an Ad)</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ActivityIndicator style={{ marginTop: 40 }} color={THEME.colors.primary} />
          )
        }
      />
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
  postNewBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  tabsWrap: {
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.divider,
    paddingVertical: 8,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  statusTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: THEME.radii.full,
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  statusTabActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  statusTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.textSecondary,
  },
  statusTabTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  adCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radii.lg,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.sm,
  },
  adTop: {
    flexDirection: "row",
    marginBottom: 10,
  },
  adThumb: {
    width: 80,
    height: 80,
    borderRadius: THEME.radii.md,
    backgroundColor: "#F1F5F9",
  },
  adInfo: {
    flex: 1,
    marginLeft: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
    marginBottom: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  adTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.colors.text,
    lineHeight: 18,
  },
  adPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.colors.primary,
    marginTop: 2,
  },
  adDate: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: THEME.colors.divider,
    paddingTop: 8,
    gap: 8,
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.colors.background,
    paddingVertical: 8,
    borderRadius: THEME.radii.sm,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: THEME.colors.text,
  },
  actionBtnDelete: {
    width: 36,
    height: 34,
    borderRadius: THEME.radii.sm,
    backgroundColor: THEME.colors.dangerLight,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: THEME.radii.md,
  },
  emptyBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
