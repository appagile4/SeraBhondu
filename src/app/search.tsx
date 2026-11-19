import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  searchListingsThunk,
  clearSearchResults,
} from "../store/slices/listingsSlice";
import { ProductCard } from "../components/common/ProductCard";
import { CATEGORIES } from "../constants/categories";
import { THEME } from "../constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 44) / 2;

const RECENT_SEARCHES = [
  "iPhone 14 Pro",
  "Yamaha R15",
  "Toyota Corolla",
  "Dhaka Apartment",
  "Samsung Galaxy S23",
  "MacBook Air M2",
];

export default function SearchScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{ q?: string; category?: string }>();

  const [query, setQuery] = useState(params.q || "");
  const [activeCategory, setActiveCategory] = useState(params.category || "all");
  const selectedCity = useAppSelector((state) => state.location.selectedCity);
  const { searchResults, isSearching } = useAppSelector((state) => state.listings);

  useEffect(() => {
    if (params.q || params.category) {
      dispatch(
        searchListingsThunk({
          q: params.q,
          category: params.category,
          city: selectedCity,
        })
      );
    }
    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch, params.q, params.category, selectedCity]);

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim() && activeCategory === "all") return;
    dispatch(
      searchListingsThunk({
        q: searchQuery.trim(),
        category: activeCategory !== "all" ? activeCategory : undefined,
        city: selectedCity,
      })
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={THEME.colors.text} />
        </TouchableOpacity>

        <View style={styles.inputWrap}>
          <Ionicons name="search" size={18} color={THEME.colors.primary} />
          <TextInput
            style={styles.searchInput}
            placeholder="সেরা বন্ধুতে যা কিছু খুঁজুন..."
            placeholderTextColor={THEME.colors.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch(query)}
            returnKeyType="search"
            autoFocus={!params.q}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.searchActionBtn} onPress={() => handleSearch(query)}>
          <Text style={styles.searchActionText}>খুঁজুন</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* Category Chips Bar */}
        <View style={styles.categoryBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          <TouchableOpacity
            style={[styles.catChip, activeCategory === "all" && styles.catChipActive]}
            onPress={() => {
              setActiveCategory("all");
              dispatch(searchListingsThunk({ q: query, city: selectedCity }));
            }}
          >
            <Text style={[styles.catChipText, activeCategory === "all" && styles.catChipTextActive]}>
              সব ক্যাটাগরি (All)
            </Text>
          </TouchableOpacity>

          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.slug;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, isSelected && styles.catChipActive]}
                onPress={() => {
                  setActiveCategory(cat.slug);
                  dispatch(searchListingsThunk({ q: query, category: cat.slug, city: selectedCity }));
                }}
              >
                <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results or Recent Searches */}
      {isSearching ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loaderText}>বিজ্ঞাপন খোঁজা হচ্ছে...</Text>
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.rowWrapper}
          contentContainerStyle={styles.resultsContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.resultCountText}>
              {searchResults.length}টি বিজ্ঞাপন পাওয়া গেছে
            </Text>
          }
          renderItem={({ item }) => (
            <ProductCard item={item} width={CARD_WIDTH} />
          )}
        />
      ) : query.trim() ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color={THEME.colors.textMuted} />
          <Text style={styles.emptyTitle}>কোনো বিজ্ঞাপন পাওয়া যায়নি</Text>
          <Text style={styles.emptySubtitle}>
            "{query}" শব্দের সাথে মিল রেখে কোনো বিজ্ঞাপন নেই। অন্য কোনো শব্দ দিয়ে চেষ্টা করুন।
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.suggestionsContainer}>
          <Text style={styles.suggestionTitle}>জনপ্রিয় ও সাম্প্রতিক সার্চ (Popular Searches)</Text>
          <View style={styles.tagWrap}>
            {RECENT_SEARCHES.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.suggestionTag}
                onPress={() => {
                  setQuery(item);
                  handleSearch(item);
                }}
              >
                <Ionicons name="trending-up" size={14} color={THEME.colors.primary} />
                <Text style={styles.suggestionTagText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
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
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    gap: 8,
  },
  backBtn: {
    padding: 4,
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.radii.full,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: THEME.colors.text,
  },
  searchActionBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: THEME.radii.full,
  },
  searchActionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  categoryBar: {
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.divider,
    paddingVertical: 8,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 6,
  },
  catChip: {
    backgroundColor: THEME.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.radii.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  catChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  catChipText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: "600",
  },
  catChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  loaderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    marginTop: 10,
    fontSize: 13,
    color: THEME.colors.textSecondary,
  },
  rowWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  resultsContent: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  resultCountText: {
    paddingHorizontal: 16,
    marginBottom: 10,
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.textSecondary,
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
  },
  suggestionsContainer: {
    padding: 20,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.colors.text,
    marginBottom: 12,
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.radii.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 6,
  },
  suggestionTagText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: "500",
  },
});
