import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchApprovedListings,
  fetchFeaturedListings,
  setSelectedCategory,
} from "../../store/slices/listingsSlice";
import { Header } from "../../components/common/Header";
import { ProductCard } from "../../components/common/ProductCard";
import { CategoryCard } from "../../components/common/CategoryCard";
import { BannerCarousel } from "../../components/common/BannerCarousel";
import { CATEGORIES } from "../../constants/categories";
import { THEME } from "../../constants/theme";
import { useLanguage } from "../../hooks/useLanguage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 44) / 2;

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useLanguage();

  const {
    approvedAds,
    featuredAds,
    selectedCategory,
    selectedCity,
    page,
    totalPages,
    isLoading,
    isRefreshing,
  } = useAppSelector((state) => state.listings);

  // Initial load
  useEffect(() => {
    dispatch(fetchApprovedListings({ category: selectedCategory, city: selectedCity, page: 1 }));
    dispatch(fetchFeaturedListings(8));
  }, [dispatch, selectedCategory, selectedCity]);

  // Pull-to-refresh
  const onRefresh = useCallback(() => {
    dispatch(
      fetchApprovedListings({
        category: selectedCategory,
        city: selectedCity,
        page: 1,
        refresh: true,
      })
    );
    dispatch(fetchFeaturedListings(8));
  }, [dispatch, selectedCategory, selectedCity]);

  // Load more pagination
  const handleLoadMore = () => {
    if (!isLoading && page < totalPages) {
      dispatch(
        fetchApprovedListings({
          category: selectedCategory,
          city: selectedCity,
          page: page + 1,
        })
      );
    }
  };

  const handleCategorySelect = (slug: string) => {
    if (selectedCategory === slug) {
      dispatch(setSelectedCategory("all"));
    } else {
      dispatch(setSelectedCategory(slug));
    }
  };

  // Header Component inside FlatList
  const renderListHeader = () => (
    <View style={styles.headerComponent}>
      {/* Search Input Bar Trigger */}
      <TouchableOpacity
        style={styles.searchBarTrigger}
        onPress={() => router.push("/search" as any)}
        activeOpacity={0.8}
      >
        <Ionicons name="search-outline" size={18} color={THEME.colors.textMuted} />
        <Text style={styles.searchBarPlaceholder}>{t("searchPlaceholder")}</Text>
        <View style={styles.filterPill}>
          <Ionicons name="options-outline" size={16} color={THEME.colors.primary} />
        </View>
      </TouchableOpacity>

      {/* Promotional Banners */}
      <BannerCarousel />

      {/* Popular Categories Horizontal Scroller */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("popularCategories")}</Text>
        <TouchableOpacity onPress={() => router.push("/categories" as any)}>
          <Text style={styles.seeAllText}>{t("viewAll")}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            isSelected={selectedCategory === cat.slug}
            onPress={() => handleCategorySelect(cat.slug)}
            variant="circular"
          />
        ))}
      </ScrollView>

      {/* Featured Ads Horizontal Carousel */}
      {featuredAds.length > 0 && (
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWithBadge}>
              <Ionicons name="sparkles" size={16} color={THEME.colors.accent} />
              <Text style={styles.sectionTitle}>{t("featuredAds")}</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredScroll}
          >
            {featuredAds.map((ad) => (
              <View key={ad._id} style={{ width: 170, marginRight: 12 }}>
                <ProductCard item={ad} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Fresh Recommendations Header */}
      <View style={[styles.sectionHeader, { marginTop: 16, marginBottom: 8 }]}>
        <Text style={styles.sectionTitle}>{t("freshRecommendations")}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          {selectedCategory !== "all" && (
            <TouchableOpacity onPress={() => dispatch(setSelectedCategory("all"))}>
              <Text style={styles.filterResetText}>{t("clearFilter")}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => router.push("/view-all" as any)}>
            <Text style={styles.seeAllText}>{t("viewAll")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Fixed Sticky Header */}
      <Header />

      <View style={styles.container}>
        {/* Main Listings Feed */}
        <FlatList
          data={approvedAds}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.rowWrapper}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderListHeader}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[THEME.colors.primary]}
              tintColor={THEME.colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoading && !isRefreshing ? (
              <View style={styles.loaderWrap}>
                <ActivityIndicator size="small" color={THEME.colors.primary} />
              </View>
            ) : undefined
          }
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="basket-outline"
                  size={48}
                  color={THEME.colors.textMuted}
                />
                <Text style={styles.emptyTitle}>{t("noAdsFound")}</Text>
                <Text style={styles.emptySubtitle}>
                  নির্বাচিত ক্যাটাগরি বা লোকেশনে কোনো বিজ্ঞাপন নেই। ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।
                </Text>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => {
                    dispatch(setSelectedCategory("all"));
                    onRefresh();
                  }}
                >
                  <Text style={styles.emptyActionText}>সব বিজ্ঞাপন দেখুন</Text>
                </TouchableOpacity>
              </View>
            ) : undefined
          }
          renderItem={({ item }) => (
            <ProductCard item={item} width={CARD_WIDTH} />
          )}
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
  listContent: {
    paddingBottom: 24,
  },
  headerComponent: {
    paddingBottom: 4,
  },
  searchBarTrigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: THEME.radii.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.sm,
  },
  searchBarPlaceholder: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: THEME.colors.textMuted,
  },
  filterPill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.colors.text,
  },
  sectionTitleWithBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.primary,
  },
  filterResetText: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.accent,
  },
  categoriesScroll: {
    paddingLeft: 16,
    paddingRight: 4,
    paddingBottom: 8,
  },
  featuredSection: {
    marginTop: 6,
  },
  featuredScroll: {
    paddingLeft: 16,
    paddingRight: 4,
  },
  rowWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  loaderWrap: {
    paddingVertical: 18,
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
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
  },
  emptyActionBtn: {
    marginTop: 16,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: THEME.radii.md,
  },
  emptyActionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
});
