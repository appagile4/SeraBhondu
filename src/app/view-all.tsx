import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ProductCard } from "../components/common/ProductCard";
import { listingsApi } from "../services/api";
import { CATEGORIES, Category } from "../constants/categories";
import { POPULAR_CITIES } from "../constants/locations";
import { THEME } from "../constants/theme";
import { useLanguage } from "../hooks/useLanguage";
import { useAppSelector } from "../store/hooks";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_CARD_WIDTH = (SCREEN_WIDTH - 44) / 2;

const getPricePresets = (sym: string) => [
  { label: "All Prices", min: undefined, max: undefined },
  { label: `< ${sym}5,000`, min: undefined, max: 5000 },
  { label: `${sym}5K - ${sym}25K`, min: 5000, max: 25000 },
  { label: `${sym}25K - ${sym}75K`, min: 25000, max: 75000 },
  { label: `> ${sym}75,000`, min: 75000, max: undefined },
];

const CONDITIONS = ["All", "Brand New", "Like New", "Used"];

export default function ViewAllScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    category?: string;
    city?: string;
    q?: string;
    condition?: string;
  }>();
  const { t, isBn, isEn, currencySymbol } = useLanguage();
  const sym = currencySymbol || (isEn ? "Tk" : "৳");
  const pricePresets = getPricePresets(sym);
  const defaultCity = useAppSelector((state) => state.location.selectedCity);

  // Active Filter States
  const [searchQuery, setSearchQuery] = useState(params.q || "");
  const [selectedCategory, setSelectedCategory] = useState(params.category || "all");
  const [selectedCity, setSelectedCity] = useState(params.city || defaultCity || "All Bangladesh");
  const [selectedCondition, setSelectedCondition] = useState(params.condition || "All");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter Modal Draft States
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [draftCategory, setDraftCategory] = useState(selectedCategory);
  const [draftCity, setDraftCity] = useState(selectedCity);
  const [draftCondition, setDraftCondition] = useState(selectedCondition);
  const [draftMinPrice, setDraftMinPrice] = useState(minPrice);
  const [draftMaxPrice, setDraftMaxPrice] = useState(maxPrice);
  const [draftSortBy, setDraftSortBy] = useState(sortBy);

  // Data & Pagination
  const [ads, setAds] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Active filter count calculation
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedCity && selectedCity !== "All Bangladesh") count++;
    if (selectedCondition !== "All") count++;
    if (minPrice || maxPrice) count++;
    if (sortBy !== "newest") count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [selectedCategory, selectedCity, selectedCondition, minPrice, maxPrice, sortBy, searchQuery]);

  // Fetch Ads from Backend API
  const fetchListings = useCallback(
    async (targetPage = 1, shouldRefresh = false) => {
      try {
        if (targetPage === 1 && !shouldRefresh) {
          setIsLoading(true);
        }

        const apiParams: Record<string, any> = {
          page: targetPage,
          limit: 14,
        };

        if (selectedCategory && selectedCategory !== "all") {
          apiParams.category = selectedCategory;
        }
        if (selectedCity && selectedCity !== "All Bangladesh") {
          apiParams.city = selectedCity;
        }
        if (selectedCondition && selectedCondition !== "All") {
          apiParams.condition = selectedCondition;
        }
        if (minPrice && !isNaN(Number(minPrice))) {
          apiParams.minPrice = Number(minPrice);
        }
        if (maxPrice && !isNaN(Number(maxPrice))) {
          apiParams.maxPrice = Number(maxPrice);
        }
        if (sortBy) {
          apiParams.sortBy = sortBy;
        }

        let response;
        if (searchQuery.trim()) {
          response = await listingsApi.search({
            ...apiParams,
            q: searchQuery.trim(),
          });
        } else {
          response = await listingsApi.getApproved(apiParams);
        }

        const fetched = response.data?.advertisements || [];
        const total = response.data?.total || fetched.length;
        const pages = response.data?.pages || 1;

        if (targetPage === 1) {
          setAds(fetched);
        } else {
          setAds((prev) => [...prev, ...fetched]);
        }

        setTotalCount(total);
        setTotalPages(pages);
        setPage(targetPage);
      } catch (err) {
        console.warn("Failed to fetch listings:", err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [selectedCategory, selectedCity, selectedCondition, minPrice, maxPrice, sortBy, searchQuery]
  );

  useEffect(() => {
    fetchListings(1);
  }, [fetchListings]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchListings(1, true);
  };

  const handleLoadMore = () => {
    if (!isLoading && !isLoadingMore && page < totalPages) {
      setIsLoadingMore(true);
      fetchListings(page + 1);
    }
  };

  // Open modal & copy current state to draft
  const openFilterModal = () => {
    setDraftCategory(selectedCategory);
    setDraftCity(selectedCity);
    setDraftCondition(selectedCondition);
    setDraftMinPrice(minPrice);
    setDraftMaxPrice(maxPrice);
    setDraftSortBy(sortBy);
    setIsFilterModalOpen(true);
  };

  // Apply modal filters
  const applyFilters = () => {
    setSelectedCategory(draftCategory);
    setSelectedCity(draftCity);
    setSelectedCondition(draftCondition);
    setMinPrice(draftMinPrice);
    setMaxPrice(draftMaxPrice);
    setSortBy(draftSortBy);
    setIsFilterModalOpen(false);
  };

  // Reset modal filters
  const resetFilters = () => {
    setDraftCategory("all");
    setDraftCity("All Bangladesh");
    setDraftCondition("All");
    setDraftMinPrice("");
    setDraftMaxPrice("");
    setDraftSortBy("newest");
  };

  // Reset all filters in main screen
  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedCity("All Bangladesh");
    setSelectedCondition("All");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
    setSearchQuery("");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={THEME.colors.text} />
        </TouchableOpacity>

        <View style={styles.searchBarWrap}>
          <Ionicons name="search" size={17} color={THEME.colors.primary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t("searchPlaceholder")}
            placeholderTextColor={THEME.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => fetchListings(1)}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={17} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Layout Toggle (Grid vs List) */}
        <TouchableOpacity
          style={styles.viewModeBtn}
          onPress={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
        >
          <Ionicons
            name={viewMode === "grid" ? "list" : "grid"}
            size={20}
            color={THEME.colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Main Body */}
      <View style={styles.container}>
        {/* Quick Filter Bar */}
        <View style={styles.quickBar}>
          {/* Main Filter Modal Trigger */}
          <TouchableOpacity
            style={[styles.filterTrigger, activeFiltersCount > 0 && styles.filterTriggerActive]}
            onPress={openFilterModal}
          >
            <Ionicons
              name="options"
              size={16}
              color={activeFiltersCount > 0 ? "#FFFFFF" : THEME.colors.primary}
            />
            <Text
              style={[
                styles.filterTriggerText,
                activeFiltersCount > 0 && styles.filterTriggerTextActive,
              ]}
            >
              {t("filtersTitle")}
            </Text>
            {activeFiltersCount > 0 && (
              <View style={styles.activeBadgeCircle}>
                <Text style={styles.activeBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Quick Category Chips Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryPills}
          >
            <TouchableOpacity
              style={[
                styles.catPill,
                selectedCategory === "all" && styles.catPillActive,
              ]}
              onPress={() => setSelectedCategory("all")}
            >
              <Text
                style={[
                  styles.catPillText,
                  selectedCategory === "all" && styles.catPillTextActive,
                ]}
              >
                {isBn ? "সকল" : "All"}
              </Text>
            </TouchableOpacity>

            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.slug;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catPill, isActive && styles.catPillActive]}
                  onPress={() => setSelectedCategory(isActive ? "all" : cat.slug)}
                >
                  <Text
                    style={[
                      styles.catPillText,
                      isActive && styles.catPillTextActive,
                    ]}
                  >
                    {isBn && cat.nameBn ? cat.nameBn : cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Active Filter Tags Bar (if any active) */}
        {activeFiltersCount > 0 && (
          <View style={styles.activeTagsRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsScroll}>
              {selectedCategory !== "all" && (
                <View style={styles.activeTag}>
                  <Text style={styles.activeTagText}>
                    {CATEGORIES.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedCategory("all")}>
                    <Ionicons name="close" size={14} color={THEME.colors.primary} />
                  </TouchableOpacity>
                </View>
              )}

              {selectedCity !== "All Bangladesh" && (
                <View style={styles.activeTag}>
                  <Text style={styles.activeTagText}>{selectedCity}</Text>
                  <TouchableOpacity onPress={() => setSelectedCity("All Bangladesh")}>
                    <Ionicons name="close" size={14} color={THEME.colors.primary} />
                  </TouchableOpacity>
                </View>
              )}

              {selectedCondition !== "All" && (
                <View style={styles.activeTag}>
                  <Text style={styles.activeTagText}>{selectedCondition}</Text>
                  <TouchableOpacity onPress={() => setSelectedCondition("All")}>
                    <Ionicons name="close" size={14} color={THEME.colors.primary} />
                  </TouchableOpacity>
                </View>
              )}

              {(minPrice || maxPrice) && (
                <View style={styles.activeTag}>
                  <Text style={styles.activeTagText}>
                    {sym}{minPrice || "0"} - {sym}{maxPrice || (isEn ? "Any" : "যেকোনো")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setMinPrice("");
                      setMaxPrice("");
                    }}
                  >
                    <Ionicons name="close" size={14} color={THEME.colors.primary} />
                  </TouchableOpacity>
                </View>
              )}

              {sortBy !== "newest" && (
                <View style={styles.activeTag}>
                  <Text style={styles.activeTagText}>
                    {sortBy === "price_asc"
                      ? "Price: Low to High"
                      : sortBy === "price_desc"
                      ? "Price: High to Low"
                      : "Oldest"}
                  </Text>
                  <TouchableOpacity onPress={() => setSortBy("newest")}>
                    <Ionicons name="close" size={14} color={THEME.colors.primary} />
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity style={styles.clearAllBtn} onPress={clearAllFilters}>
                <Text style={styles.clearAllText}>{t("resetFilters")}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Results Counter & Sorting Label */}
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            <Text style={{ fontWeight: "700", color: THEME.colors.text }}>{totalCount}</Text>{" "}
            {t("foundAdsCount")}
          </Text>
          <TouchableOpacity
            style={styles.sortTrigger}
            onPress={() => {
              const nextSort =
                sortBy === "newest"
                  ? "price_asc"
                  : sortBy === "price_asc"
                  ? "price_desc"
                  : "newest";
              setSortBy(nextSort);
            }}
          >
            <Ionicons name="swap-vertical" size={14} color={THEME.colors.primary} />
            <Text style={styles.sortTriggerText}>
              {sortBy === "price_asc"
                ? `${sym} Low → High`
                : sortBy === "price_desc"
                ? `${sym} High → Low`
                : "Newest"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Listings Feed */}
        {isLoading ? (
          <View style={styles.loaderCenter}>
            <ActivityIndicator size="large" color={THEME.colors.primary} />
            <Text style={styles.loaderText}>বিজ্ঞাপন খোঁজা হচ্ছে...</Text>
          </View>
        ) : (
          <FlatList
            key={viewMode}
            data={ads}
            keyExtractor={(item) => item._id}
            numColumns={viewMode === "grid" ? 2 : 1}
            columnWrapperStyle={viewMode === "grid" ? styles.rowWrapper : undefined}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[THEME.colors.primary]}
                tintColor={THEME.colors.primary}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isLoadingMore ? (
                <View style={styles.moreLoader}>
                  <ActivityIndicator size="small" color={THEME.colors.primary} />
                </View>
              ) : undefined
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={54} color={THEME.colors.textMuted} />
                <Text style={styles.emptyTitle}>{t("noAdsFound")}</Text>
                <Text style={styles.emptyDesc}>
                  কোনো বিজ্ঞাপন পাওয়া যায়নি। ফিল্টার বা অনুসন্ধানের শব্দ পরিবর্তন করে চেষ্টা করুন।
                </Text>
                <TouchableOpacity style={styles.resetBtn} onPress={clearAllFilters}>
                  <Text style={styles.resetBtnText}>{t("resetFilters")}</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item }) => (
              <ProductCard
                item={item}
                width={viewMode === "grid" ? GRID_CARD_WIDTH : SCREEN_WIDTH - 32}
              />
            )}
          />
        )}
      </View>

      {/* Comprehensive Filter Modal */}
      <Modal
        visible={isFilterModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsFilterModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setIsFilterModalOpen(false)}>
                <Ionicons name="close" size={24} color={THEME.colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{t("filtersTitle")}</Text>
              <TouchableOpacity onPress={resetFilters}>
                <Text style={styles.modalResetText}>{t("resetFilters")}</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Filter Sections */}
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* SECTION 1: Sort By */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionHeading}>{t("sortBy")}</Text>
                <View style={styles.chipRow}>
                  {[
                    { id: "newest", label: t("sortNewest") },
                    { id: "price_asc", label: t("sortPriceLow") },
                    { id: "price_desc", label: t("sortPriceHigh") },
                    { id: "oldest", label: t("sortOldest") },
                  ].map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={[
                        styles.filterChip,
                        draftSortBy === s.id && styles.filterChipActive,
                      ]}
                      onPress={() => setDraftSortBy(s.id)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          draftSortBy === s.id && styles.filterChipTextActive,
                        ]}
                      >
                        {s.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* SECTION 2: Category */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionHeading}>{t("categories")}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalChips}>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      draftCategory === "all" && styles.filterChipActive,
                    ]}
                    onPress={() => setDraftCategory("all")}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        draftCategory === "all" && styles.filterChipTextActive,
                      ]}
                    >
                      {isBn ? "সকল ক্যাটাগরি" : "All Categories"}
                    </Text>
                  </TouchableOpacity>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.filterChip,
                        draftCategory === cat.slug && styles.filterChipActive,
                      ]}
                      onPress={() => setDraftCategory(cat.slug)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          draftCategory === cat.slug && styles.filterChipTextActive,
                        ]}
                      >
                        {isBn && cat.nameBn ? cat.nameBn : cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* SECTION 3: Location / City */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionHeading}>{t("location")}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalChips}>
                  {POPULAR_CITIES.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.filterChip,
                        draftCity === c.name && styles.filterChipActive,
                      ]}
                      onPress={() => setDraftCity(c.name)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          draftCity === c.name && styles.filterChipTextActive,
                        ]}
                      >
                        {isBn && c.nameBn ? c.nameBn : c.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* SECTION 4: Condition */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionHeading}>{t("condition")}</Text>
                <View style={styles.chipRow}>
                  {CONDITIONS.map((cond) => (
                    <TouchableOpacity
                      key={cond}
                      style={[
                        styles.filterChip,
                        draftCondition === cond && styles.filterChipActive,
                      ]}
                      onPress={() => setDraftCondition(cond)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          draftCondition === cond && styles.filterChipTextActive,
                        ]}
                      >
                        {cond === "All"
                          ? t("conditionAll")
                          : cond === "Brand New"
                          ? t("conditionNew")
                          : cond === "Like New"
                          ? t("conditionLikeNew")
                          : t("conditionUsed")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* SECTION 5: Price Range */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionHeading}>{t("priceRange")}</Text>
                {/* Number Inputs */}
                <View style={styles.priceInputsRow}>
                  <View style={styles.priceInputBox}>
                    <Text style={styles.currencyPrefix}>{sym}</Text>
                    <TextInput
                      style={styles.priceTextInput}
                      placeholder={t("minPricePlaceholder")}
                      placeholderTextColor={THEME.colors.textMuted}
                      keyboardType="numeric"
                      value={draftMinPrice}
                      onChangeText={setDraftMinPrice}
                    />
                  </View>
                  <Text style={styles.priceDash}>—</Text>
                  <View style={styles.priceInputBox}>
                    <Text style={styles.currencyPrefix}>{sym}</Text>
                    <TextInput
                      style={styles.priceTextInput}
                      placeholder={t("maxPricePlaceholder")}
                      placeholderTextColor={THEME.colors.textMuted}
                      keyboardType="numeric"
                      value={draftMaxPrice}
                      onChangeText={setDraftMaxPrice}
                    />
                  </View>
                </View>

                {/* Quick Presets */}
                <View style={[styles.chipRow, { marginTop: 10 }]}>
                  {pricePresets.map((p, idx) => {
                    const isSelected =
                      (p.min ? String(p.min) : "") === draftMinPrice &&
                      (p.max ? String(p.max) : "") === draftMaxPrice;
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.presetChip, isSelected && styles.presetChipActive]}
                        onPress={() => {
                          setDraftMinPrice(p.min ? String(p.min) : "");
                          setDraftMaxPrice(p.max ? String(p.max) : "");
                        }}
                      >
                        <Text style={[styles.presetChipText, isSelected && styles.presetChipTextActive]}>
                          {p.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            {/* Modal Bottom Apply Button */}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
                <Text style={styles.applyBtnText}>{t("applyFilters")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBarWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.radii.full,
    paddingHorizontal: 12,
    height: 38,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: THEME.colors.text,
  },
  viewModeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  quickBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
    gap: 10,
  },
  filterTrigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: THEME.radii.full,
    gap: 6,
  },
  filterTriggerActive: {
    backgroundColor: THEME.colors.primary,
  },
  filterTriggerText: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.colors.primary,
  },
  filterTriggerTextActive: {
    color: "#FFFFFF",
  },
  activeBadgeCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: THEME.colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  activeBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  categoryPills: {
    gap: 8,
    paddingRight: 16,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.radii.full,
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  catPillActive: {
    backgroundColor: THEME.colors.primaryLight,
    borderColor: THEME.colors.primary,
  },
  catPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.textSecondary,
  },
  catPillTextActive: {
    color: THEME.colors.primary,
    fontWeight: "700",
  },
  activeTagsRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  tagsScroll: {
    alignItems: "center",
    gap: 8,
  },
  activeTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.radii.full,
    gap: 6,
  },
  activeTagText: {
    fontSize: 11,
    fontWeight: "600",
    color: THEME.colors.primary,
  },
  clearAllBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearAllText: {
    fontSize: 11,
    fontWeight: "700",
    color: THEME.colors.accent,
  },
  countRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  countText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  sortTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sortTriggerText: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.primary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  rowWrapper: {
    justifyContent: "space-between",
  },
  loaderCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loaderText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
  },
  moreLoader: {
    paddingVertical: 16,
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.colors.text,
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 16,
  },
  resetBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.radii.full,
  },
  resetBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.colors.text,
  },
  modalResetText: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.colors.accent,
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  filterSection: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.colors.text,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  horizontalChips: {
    gap: 8,
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: THEME.radii.full,
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  filterChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.textSecondary,
  },
  filterChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  priceInputsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  priceInputBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radii.md,
    paddingHorizontal: 10,
    height: 42,
  },
  currencyPrefix: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.colors.textMuted,
    marginRight: 4,
  },
  priceTextInput: {
    flex: 1,
    fontSize: 13,
    color: THEME.colors.text,
  },
  priceDash: {
    fontSize: 16,
    color: THEME.colors.textMuted,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.radii.full,
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  presetChipActive: {
    backgroundColor: THEME.colors.primaryLight,
    borderColor: THEME.colors.primary,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: THEME.colors.textSecondary,
  },
  presetChipTextActive: {
    color: THEME.colors.primary,
    fontWeight: "700",
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderLight,
  },
  applyBtn: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 14,
    borderRadius: THEME.radii.lg,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  applyBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
