import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Linking,
  Share,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchListingBySlug,
  fetchRelatedListings,
} from "../../store/slices/listingsSlice";
import { toggleFavouriteThunk } from "../../store/slices/favouritesSlice";
import { setAuthModalVisible } from "../../store/slices/authSlice";
import { chatApi } from "../../services/api";
import { ProductCard } from "../../components/common/ProductCard";
import { THEME } from "../../constants/theme";
import { useLanguage } from "../../hooks/useLanguage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ListingDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { currentAd, relatedAds, isLoading } = useAppSelector(
    (state) => state.listings
  );
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const favouriteIds = useAppSelector((state) => state.favourites.favouriteIds);
  const { isEn, currencySymbol } = useLanguage();
  const sym = currencySymbol || (isEn ? "Tk" : "৳");

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    if (slug) {
      dispatch(fetchListingBySlug(slug)).then((action: any) => {
        if (action.payload?._id) {
          dispatch(fetchRelatedListings(action.payload._id));
        }
      });
    }
  }, [dispatch, slug]);

  if (isLoading || !currentAd) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </SafeAreaView>
    );
  }

  const isFav = favouriteIds.includes(currentAd._id);
  const isOwner = user && currentAd.seller?._id === user._id;

  const handleToggleFav = () => {
    dispatch(toggleFavouriteThunk(currentAd));
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `সেরা বন্ধুতে এই বিজ্ঞাপনটি দেখুন: ${currentAd.title} - ৳ ${Number(currentAd.price).toLocaleString("en-BD")} | https://serabondhu.net/listing/${currentAd.slug}`,
      });
    } catch (err) {}
  };

  const handleCall = () => {
    const phone = currentAd.sellerContact?.phone || currentAd.seller?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert(
        "ফোন নম্বর পাওয়া যায়নি",
        "বিক্রেতার সাথে ইন-অ্যাপ চ্যাট বার্তার মাধ্যমে যোগাযোগ করুন।"
      );
    }
  };

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      dispatch(setAuthModalVisible(true));
      return;
    }

    if (isOwner) {
      Alert.alert(
        "নিজের বিজ্ঞাপন",
        "আপনি নিজের বিজ্ঞাপনে চ্যাট শুরু করতে পারবেন না।"
      );
      return;
    }

    setStartingChat(true);
    try {
      const res = await chatApi.getOrCreateConversation(currentAd._id);
      if (res.data?.conversation?._id) {
        router.push({
          pathname: "/chat/[id]",
          params: { id: res.data.conversation._id },
        } as any);
      }
    } catch (err: any) {
      Alert.alert(
        "চ্যাট শুরু করা যায়নি",
        err.response?.data?.message || "অনুগ্রহ করে আবার চেষ্টা করুন।"
      );
    } finally {
      setStartingChat(false);
    }
  };

  const images = currentAd.images?.length > 0 ? currentAd.images : [{ url: "https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&w=600&q=80" }];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={THEME.colors.text} />
        </TouchableOpacity>

        <View style={styles.navRight}>
          <TouchableOpacity style={styles.navBtn} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={22} color={THEME.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={handleToggleFav}>
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={22}
              color={isFav ? THEME.colors.danger : THEME.colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Photo Gallery Carousel */}
        <View style={styles.galleryContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActiveImageIdx(idx);
            }}
          >
            {images.map((img, idx) => (
              <Image
                key={idx}
                source={{ uri: img.url }}
                style={styles.galleryImage}
                contentFit="contain"
              />
            ))}
          </ScrollView>

          {/* Indicator Counter Badge */}
          {images.length > 1 && (
            <View style={styles.counterBadge}>
              <Text style={styles.counterText}>
                {activeImageIdx + 1} / {images.length}
              </Text>
            </View>
          )}

          {/* Featured Badge */}
          {currentAd.isFeatured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="sparkles" size={12} color="#FFFFFF" />
              <Text style={styles.featuredText}>ফিচার্ড বিজ্ঞাপন</Text>
            </View>
          )}
        </View>

        {/* Pricing & Key Meta Section */}
        <View style={styles.mainInfoCard}>
          <Text style={styles.priceText}>
            {sym} {Number(currentAd.price).toLocaleString("en-BD")}
          </Text>
          <Text style={styles.titleText}>{currentAd.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={THEME.colors.primary} />
              <Text style={styles.metaItemText}>
                {currentAd.location?.area ? `${currentAd.location.area}, ` : ""}
                {currentAd.location?.city || "Bangladesh"}
              </Text>
            </View>

            <View style={styles.conditionTag}>
              <Text style={styles.conditionTagText}>
                {currentAd.condition === "Used" ? "ব্যবহৃত (Used)" : "নতুন (New)"}
              </Text>
            </View>
          </View>

          <Text style={styles.dateText}>
            পোস্ট করা হয়েছে:{" "}
            {new Date(currentAd.createdAt).toLocaleDateString("bn-BD", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Text>
        </View>

        {/* Description Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>বিজ্ঞাপনের বিবরণ (Description)</Text>
          <Text style={styles.descriptionText}>{currentAd.description}</Text>
        </View>

        {/* Seller Info Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>বিক্রেতার তথ্য (Seller Info)</Text>
          <View style={styles.sellerRow}>
            <Image
              source={{
                uri:
                  currentAd.seller?.avatar ||
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
              }}
              style={styles.sellerAvatar}
            />
            <View style={styles.sellerDetails}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={styles.sellerName}>
                  {currentAd.sellerContact?.name || currentAd.seller?.name || "Serabondhu Seller"}
                </Text>
                {currentAd.seller?.isVerified && (
                  <Ionicons name="checkmark-circle" size={16} color={THEME.colors.primary} />
                )}
              </View>
              <Text style={styles.sellerLocation}>
                {currentAd.seller?.city || currentAd.location?.city || "Bangladesh"}
              </Text>
            </View>
          </View>
        </View>

        {/* Safety Guidelines Warning Banner */}
        <View style={styles.safetyCard}>
          <View style={styles.safetyHeader}>
            <Ionicons name="shield-checkmark" size={18} color={THEME.colors.primary} />
            <Text style={styles.safetyTitle}>নিরাপদ কেনাবেচার টিপস</Text>
          </View>
          <Text style={styles.safetyBullet}>• সরাসরি দেখা করে পণ্য যাচাই করার আগে টাকা পাঠাবেন না।</Text>
          <Text style={styles.safetyBullet}>• কোনো বিকাশ, নগদ বা অগ্রিম পেমেন্ট করবেন না।</Text>
          <Text style={styles.safetyBullet}>• সবসময় জনবহুল বা পরিচিত জায়গায় দেখা করুন।</Text>
        </View>

        {/* Related Listings */}
        {relatedAds.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedHeader}>সম্পর্কিত বিজ্ঞাপন (Related Ads)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {relatedAds.map((ad) => (
                <View key={ad._id} style={{ width: 170, marginRight: 12 }}>
                  <ProductCard item={ad} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Action Buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.callButton}
          onPress={handleCall}
          activeOpacity={0.8}
        >
          <Ionicons name="call" size={18} color={THEME.colors.primary} />
          <Text style={styles.callButtonText}>কল করুন (Call)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chatButton, startingChat && { opacity: 0.7 }]}
          onPress={handleStartChat}
          disabled={startingChat}
          activeOpacity={0.8}
        >
          {startingChat ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="chatbubbles" size={18} color="#FFFFFF" />
              <Text style={styles.chatButtonText}>চ্যাট করুন (Chat)</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME.colors.background,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  navRight: {
    flexDirection: "row",
    gap: 8,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  galleryContainer: {
    width: SCREEN_WIDTH,
    height: 280,
    backgroundColor: "#F1F5F9",
    position: "relative",
  },
  galleryImage: {
    width: SCREEN_WIDTH,
    height: 280,
  },
  counterBadge: {
    position: "absolute",
    bottom: 12,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  featuredBadge: {
    position: "absolute",
    top: 12,
    left: 16,
    backgroundColor: THEME.colors.accent,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  featuredText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  mainInfoCard: {
    backgroundColor: THEME.colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  priceText: {
    fontSize: 24,
    fontWeight: "800",
    color: THEME.colors.primary,
    marginBottom: 6,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.colors.text,
    lineHeight: 22,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaItemText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    fontWeight: "500",
  },
  conditionTag: {
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  conditionTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: THEME.colors.primary,
  },
  dateText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  sectionCard: {
    backgroundColor: THEME.colors.surface,
    padding: 16,
    marginTop: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: THEME.colors.border,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.colors.text,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 20,
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E2E8F0",
  },
  sellerDetails: {
    marginLeft: 12,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.colors.text,
  },
  sellerLocation: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  safetyCard: {
    backgroundColor: THEME.colors.primaryLight,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderRadius: THEME.radii.md,
  },
  safetyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  safetyTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.colors.primary,
  },
  safetyBullet: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },
  relatedSection: {
    marginTop: 16,
    paddingLeft: 16,
  },
  relatedHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.colors.text,
    marginBottom: 12,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: THEME.colors.surface,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    gap: 12,
    ...THEME.shadows.lg,
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.colors.primaryLight,
    height: 46,
    borderRadius: THEME.radii.md,
    gap: 8,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.colors.primary,
  },
  chatButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.colors.primary,
    height: 46,
    borderRadius: THEME.radii.md,
    gap: 8,
  },
  chatButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
