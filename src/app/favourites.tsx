import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loadFavourites } from "../store/slices/favouritesSlice";
import { ProductCard } from "../components/common/ProductCard";
import { THEME } from "../constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 44) / 2;

export default function FavouritesScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { favouriteItems } = useAppSelector((state) => state.favourites);

  useEffect(() => {
    dispatch(loadFavourites());
  }, [dispatch]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={THEME.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>পছন্দের তালিকা (Saved / Wishlist)</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.container}>
        {favouriteItems.length > 0 ? (
        <FlatList
          data={favouriteItems}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.rowWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.countText}>
              মোট {favouriteItems.length}টি সংরক্ষিত বিজ্ঞাপন
            </Text>
          }
          renderItem={({ item }) => (
            <ProductCard item={item} width={CARD_WIDTH} />
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="heart-outline" size={44} color={THEME.colors.accent} />
          </View>
          <Text style={styles.emptyTitle}>পছন্দের তালিকায় কিছু নেই</Text>
          <Text style={styles.emptySubtitle}>
            যেকোনো বিজ্ঞাপনের হার্ট (Heart) আইকনে ট্যাপ করে আপনি পছন্দের বিজ্ঞাপনগুলো পরবর্তীতে দেখার জন্য সংরক্ষণ করতে পারেন।
          </Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.push("/(tabs)" as any)}
          >
            <Text style={styles.browseBtnText}>বিজ্ঞাপন দেখুন (Browse Ads)</Text>
          </TouchableOpacity>
        </View>
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
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  rowWrapper: {
    justifyContent: "space-between",
  },
  countText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: 12,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: THEME.colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  browseBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: THEME.radii.md,
  },
  browseBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
