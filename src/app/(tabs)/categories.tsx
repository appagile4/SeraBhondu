import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  TextInput,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAppDispatch } from "../../store/hooks";
import { setSelectedCategory } from "../../store/slices/listingsSlice";
import { CATEGORIES, Category } from "../../constants/categories";
import { THEME } from "../../constants/theme";
import { useLanguage } from "../../hooks/useLanguage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PADDING = 16;
const CARD_GAP = 12;
const GRID_CARD_WIDTH = (SCREEN_WIDTH - PADDING * 2 - CARD_GAP) / 2;

type CategoryGroup = "all" | "vehicles" | "property" | "electronics" | "services_jobs" | "lifestyle";

interface GroupDef {
  key: CategoryGroup;
  labelKey: keyof typeof import("../../constants/translations").TRANSLATIONS;
  icon: keyof typeof Ionicons.glyphMap;
  slugs?: string[];
}

const GROUPS: GroupDef[] = [
  { key: "all", labelKey: "allGroup", icon: "apps-outline" },
  { key: "vehicles", labelKey: "vehiclesGroup", icon: "car-outline", slugs: ["cars", "bikes", "commercial-vehicles"] },
  { key: "property", labelKey: "propertyGroup", icon: "home-outline", slugs: ["properties"] },
  { key: "electronics", labelKey: "electronicsGroup", icon: "hardware-chip-outline", slugs: ["electronics", "mobiles"] },
  { key: "services_jobs", labelKey: "servicesJobsGroup", icon: "briefcase-outline", slugs: ["jobs", "services"] },
  { key: "lifestyle", labelKey: "lifestyleGroup", icon: "shirt-outline", slugs: ["furniture", "fashion", "pets", "books-sports-hobbies"] },
];

export default function CategoriesScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t, isBn } = useLanguage();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<CategoryGroup>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCatModal, setSelectedCatModal] = useState<Category | null>(null);
  const [subSearchQuery, setSubSearchQuery] = useState("");

  // Filter categories by search and active group
  const filteredCategories = useMemo(() => {
    let list = CATEGORIES;

    // Filter by group
    if (activeGroup !== "all") {
      const groupDef = GROUPS.find((g) => g.key === activeGroup);
      if (groupDef?.slugs) {
        list = list.filter((cat) => groupDef.slugs!.includes(cat.slug));
      }
    }

    // Filter by search
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (cat) =>
          cat.name.toLowerCase().includes(q) ||
          (cat.nameBn && cat.nameBn.includes(q)) ||
          cat.subCategories.some((sub) => sub.name.toLowerCase().includes(q))
      );
    }

    return list;
  }, [searchQuery, activeGroup]);

  // Filtered subcategories for modal
  const modalSubcategories = useMemo(() => {
    if (!selectedCatModal) return [];
    const q = subSearchQuery.trim().toLowerCase();
    if (!q) return selectedCatModal.subCategories;
    return selectedCatModal.subCategories.filter((sub) =>
      sub.name.toLowerCase().includes(q)
    );
  }, [selectedCatModal, subSearchQuery]);

  const handleOpenCategory = (category: Category) => {
    setSubSearchQuery("");
    setSelectedCatModal(category);
  };

  const handleViewAllInCategory = (category: Category) => {
    setSelectedCatModal(null);
    dispatch(setSelectedCategory(category.slug));
    router.push({
      pathname: "/view-all",
      params: { category: category.slug },
    } as any);
  };

  const handleSelectSubCategory = (category: Category, subName: string) => {
    setSelectedCatModal(null);
    dispatch(setSelectedCategory(category.slug));
    router.push({
      pathname: "/view-all",
      params: { category: category.slug, q: subName },
    } as any);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{t("allCategoriesTitle")}</Text>
            <Text style={styles.headerSubtitle}>
              {filteredCategories.length} {isBn ? "ক্যাটাগরি উপলব্ধ" : "categories available"}
            </Text>
          </View>

          {/* Grid / List Mode Switcher */}
          <View style={styles.viewToggleContainer}>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === "grid" && styles.toggleBtnActive]}
              onPress={() => setViewMode("grid")}
              activeOpacity={0.7}
              accessibilityLabel={t("gridView")}
            >
              <Ionicons
                name="grid"
                size={16}
                color={viewMode === "grid" ? THEME.colors.primary : THEME.colors.textMuted}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === "list" && styles.toggleBtnActive]}
              onPress={() => setViewMode("list")}
              activeOpacity={0.7}
              accessibilityLabel={t("listView")}
            >
              <Ionicons
                name="list"
                size={18}
                color={viewMode === "list" ? THEME.colors.primary : THEME.colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={THEME.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={t("searchCategoriesPlaceholder")}
            placeholderTextColor={THEME.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Group Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.groupScrollContent}
        >
          {GROUPS.map((group) => {
            const isActive = activeGroup === group.key;
            return (
              <TouchableOpacity
                key={group.key}
                style={[styles.groupPill, isActive && styles.groupPillActive]}
                onPress={() => setActiveGroup(group.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={group.icon}
                  size={14}
                  color={isActive ? "#FFFFFF" : THEME.colors.textSecondary}
                />
                <Text style={[styles.groupPillText, isActive && styles.groupPillTextActive]}>
                  {t(group.labelKey as any)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner: Explore All Ads with Deep Filters */}
        <TouchableOpacity
          style={styles.featuredFilterBanner}
          activeOpacity={0.9}
          onPress={() => router.push("/view-all" as any)}
        >
          <View style={styles.bannerLeft}>
            <View style={styles.bannerBadge}>
              <Ionicons name="flash" size={13} color="#FFFFFF" />
              <Text style={styles.bannerBadgeText}>{isBn ? "স্মার্ট ফিল্টার" : "Smart Filter"}</Text>
            </View>
            <Text style={styles.bannerTitle}>
              {t("viewAllCategoriesBanner")}
            </Text>
            <Text style={styles.bannerSubtitle}>
              {isBn
                ? "মূল্য, শহর, কন্ডিশন ও অন্যান্য ফিল্টার দিয়ে পণ্য খুঁজুন"
                : "Filter by price range, city, condition & instant sorting"}
            </Text>
            <View style={styles.bannerActionBtn}>
              <Text style={styles.bannerActionText}>{t("allAdsTitle")}</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </View>
          </View>
          <View style={styles.bannerIconCircle}>
            <Ionicons name="options-outline" size={32} color={THEME.colors.primary} />
          </View>
        </TouchableOpacity>

        {/* Categories Content: Grid or List */}
        {filteredCategories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={48} color={THEME.colors.textMuted} />
            <Text style={styles.emptyTitle}>
              {isBn ? "কোনো ক্যাটাগরি পাওয়া যায়নি" : "No categories found"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {isBn ? "অন্য কিওয়ার্ড দিয়ে খুঁজুন" : "Try searching with different keywords"}
            </Text>
            <TouchableOpacity
              style={styles.clearSearchBtn}
              onPress={() => {
                setSearchQuery("");
                setActiveGroup("all");
              }}
            >
              <Text style={styles.clearSearchText}>{t("clearFilter")}</Text>
            </TouchableOpacity>
          </View>
        ) : viewMode === "grid" ? (
          /* Grid View Mode */
          <View style={styles.gridContainer}>
            {filteredCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.gridCard}
                onPress={() => handleOpenCategory(cat)}
                activeOpacity={0.82}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={styles.iconCircle}>
                    <Image
                      source={cat.image}
                      style={styles.cardImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.subCountBadge}>
                    <Text style={styles.subCountText}>{cat.subCategories.length}</Text>
                  </View>
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {isBn && cat.nameBn ? cat.nameBn : cat.name}
                  </Text>
                  {isBn && cat.nameBn ? (
                    <Text style={styles.cardTitleEn} numberOfLines={1}>
                      {cat.name}
                    </Text>
                  ) : (
                    <Text style={styles.cardSubtitle} numberOfLines={1}>
                      {cat.subCategories.slice(0, 2).map((s) => s.name).join(", ")}
                    </Text>
                  )}
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.exploreText}>{isBn ? "উপবিভাগ দেখুন" : "Explore"}</Text>
                  <Ionicons name="chevron-forward" size={14} color={THEME.colors.primary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          /* List View Mode */
          <View style={styles.listContainer}>
            {filteredCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.listCard}
                onPress={() => handleOpenCategory(cat)}
                activeOpacity={0.75}
              >
                <View style={styles.listIconCircle}>
                  <Image
                    source={cat.image}
                    style={styles.listCardImage}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.listCardBody}>
                  <View style={styles.listCardTitleRow}>
                    <Text style={styles.listCardTitle} numberOfLines={1}>
                      {isBn && cat.nameBn ? cat.nameBn : cat.name}
                    </Text>
                    {isBn && cat.nameBn && (
                      <Text style={styles.listCardTitleSub} numberOfLines={1}>
                        ({cat.name})
                      </Text>
                    )}
                  </View>
                  <Text style={styles.listCardSubPreview} numberOfLines={1}>
                    {cat.subCategories.map((s) => s.name).join(" • ")}
                  </Text>
                </View>

                <View style={styles.listCardRight}>
                  <View style={styles.listBadge}>
                    <Text style={styles.listBadgeText}>
                      {cat.subCategories.length} {t("subcategories")}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMuted} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Enhanced Subcategories Bottom Sheet Modal */}
      {selectedCatModal && (
        <Modal
          visible={!!selectedCatModal}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedCatModal(null)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdropTap}
              activeOpacity={1}
              onPress={() => setSelectedCatModal(null)}
            />
            <View style={styles.modalSheet}>
              {/* Sheet Drag Handle */}
              <View style={styles.modalHandle} />

              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <View style={styles.modalIconBox}>
                    <Image
                      source={selectedCatModal.image}
                      style={styles.modalCatIcon}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle} numberOfLines={1}>
                      {isBn && selectedCatModal.nameBn ? selectedCatModal.nameBn : selectedCatModal.name}
                    </Text>
                    {isBn && selectedCatModal.nameBn ? (
                      <Text style={styles.modalSubtitle} numberOfLines={1}>
                        {selectedCatModal.name} • {selectedCatModal.subCategories.length} {t("subcategories")}
                      </Text>
                    ) : (
                      <Text style={styles.modalSubtitle} numberOfLines={1}>
                        {selectedCatModal.subCategories.length} {t("subcategories")}
                      </Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedCatModal(null)}
                >
                  <Ionicons name="close" size={20} color={THEME.colors.text} />
                </TouchableOpacity>
              </View>

              {/* View All In Category CTA Button */}
              <TouchableOpacity
                style={styles.viewAllInCatBtn}
                onPress={() => handleViewAllInCategory(selectedCatModal)}
                activeOpacity={0.85}
              >
                <View style={styles.viewAllInCatLeft}>
                  <Ionicons name="options" size={18} color="#FFFFFF" />
                  <Text style={styles.viewAllInCatText}>
                    {t("viewAllAdsIn")} {isBn && selectedCatModal.nameBn ? selectedCatModal.nameBn : selectedCatModal.name}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Search Inside Subcategories */}
              {selectedCatModal.subCategories.length > 5 && (
                <View style={styles.subSearchContainer}>
                  <Ionicons name="search" size={16} color={THEME.colors.textMuted} />
                  <TextInput
                    style={styles.subSearchInput}
                    placeholder={t("searchSubcategories")}
                    placeholderTextColor={THEME.colors.textMuted}
                    value={subSearchQuery}
                    onChangeText={setSubSearchQuery}
                  />
                  {subSearchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSubSearchQuery("")}>
                      <Ionicons name="close-circle" size={16} color={THEME.colors.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Subcategories List */}
              <ScrollView
                style={styles.subList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
              >
                {modalSubcategories.length === 0 ? (
                  <View style={styles.subEmptyBox}>
                    <Text style={styles.subEmptyText}>
                      {isBn ? "কোনো সাবক্যাটাগরি মেলেনি" : "No matching subcategories"}
                    </Text>
                  </View>
                ) : (
                  modalSubcategories.map((sub, index) => (
                    <TouchableOpacity
                      key={sub.id || index}
                      style={styles.subItem}
                      onPress={() => handleSelectSubCategory(selectedCatModal, sub.name)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.subItemLeft}>
                        <View style={styles.subBullet} />
                        <Text style={styles.subItemText}>{sub.name}</Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={THEME.colors.textMuted}
                      />
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
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
    paddingHorizontal: PADDING,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: THEME.colors.text,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  viewToggleContainer: {
    flexDirection: "row",
    backgroundColor: THEME.colors.background,
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  toggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: THEME.colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.radii.full,
    paddingHorizontal: 14,
    height: 40,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: THEME.colors.text,
  },
  groupScrollContent: {
    gap: 8,
    paddingVertical: 2,
  },
  groupPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.radii.full,
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  groupPillActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  groupPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.textSecondary,
  },
  groupPillTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  scrollContent: {
    padding: PADDING,
    paddingBottom: 40,
  },
  featuredFilterBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0D532C",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    shadowColor: "#0D532C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  bannerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  bannerBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.radii.full,
    gap: 4,
    marginBottom: 6,
  },
  bannerBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
    lineHeight: 22,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 12,
    lineHeight: 16,
  },
  bannerActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  bannerActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  bannerIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: CARD_GAP,
  },
  gridCard: {
    width: GRID_CARD_WIDTH,
    backgroundColor: THEME.colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1.5,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  cardImage: {
    width: 28,
    height: 28,
  },
  subCountBadge: {
    backgroundColor: THEME.colors.background,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  subCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: THEME.colors.primary,
  },
  cardInfo: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.colors.text,
    marginBottom: 2,
  },
  cardTitleEn: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  cardSubtitle: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  exploreText: {
    fontSize: 11,
    fontWeight: "600",
    color: THEME.colors.primary,
  },
  listContainer: {
    gap: 8,
  },
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 12,
  },
  listIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  listCardImage: {
    width: 26,
    height: 26,
  },
  listCardBody: {
    flex: 1,
  },
  listCardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  listCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.colors.text,
  },
  listCardTitleSub: {
    fontSize: 12,
    color: THEME.colors.textMuted,
  },
  listCardSubPreview: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  listCardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  listBadge: {
    backgroundColor: THEME.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  listBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: THEME.colors.textSecondary,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.colors.text,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  clearSearchBtn: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: THEME.colors.primary,
    borderRadius: 8,
  },
  clearSearchText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  modalBackdropTap: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "82%",
    paddingTop: 10,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.colors.border,
    alignSelf: "center",
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  modalIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCatIcon: {
    width: 26,
    height: 26,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.colors.text,
  },
  modalSubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  viewAllInCatBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: THEME.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 12,
    marginBottom: 10,
  },
  viewAllInCatLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  viewAllInCatText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
  },
  subSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 38,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 8,
    marginBottom: 8,
  },
  subSearchInput: {
    flex: 1,
    fontSize: 12,
    color: THEME.colors.text,
  },
  subList: {
    marginTop: 4,
  },
  subItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  subItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  subBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.primary,
  },
  subItemText: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.colors.text,
    flex: 1,
  },
  subEmptyBox: {
    paddingVertical: 24,
    alignItems: "center",
  },
  subEmptyText: {
    fontSize: 13,
    color: THEME.colors.textMuted,
  },
});
