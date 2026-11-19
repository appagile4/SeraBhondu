import React, { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Image } from "expo-image";
import { bannersApi } from "../../services/api";
import { THEME } from "../../constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_WIDTH = SCREEN_WIDTH - 32;

interface BannerItem {
  _id: string;
  title?: string;
  imageUrl?: string;
  image?: { url: string };
  link?: string;
}

const FALLBACK_BANNERS: BannerItem[] = [
  {
    _id: "banner-1",
    imageUrl:
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1000&q=80",
  },
  {
    _id: "banner-2",
    imageUrl:
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80",
  },
  {
    _id: "banner-3",
    imageUrl:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80",
  },
];

export const BannerCarousel: React.FC = () => {
  const [banners, setBanners] = useState<BannerItem[]>(FALLBACK_BANNERS);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  activeIndexRef.current = activeIndex;
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    bannersApi
      .getActive()
      .then((res) => {
        if (res.data?.banners && res.data.banners.length > 0) {
          setBanners(res.data.banners);
        }
      })
      .catch(() => {
        // Fallback used silently
      });
  }, []);

  // Smooth Auto-scroll effect
  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      const nextIndex = (activeIndexRef.current + 1) % banners.length;
      try {
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        setActiveIndex(nextIndex);
      } catch {
        try {
          flatListRef.current?.scrollToOffset({
            offset: nextIndex * SCREEN_WIDTH,
            animated: true,
          });
          setActiveIndex(nextIndex);
        } catch {
          // Ignore
        }
      }
    }, 4500);

    return () => clearInterval(timer);
  }, [banners.length]);

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.x;
    const index = Math.round(offset / SCREEN_WIDTH);
    if (index >= 0 && index < banners.length) {
      setActiveIndex(index);
    }
  };

  const scrollToBanner = (index: number) => {
    try {
      flatListRef.current?.scrollToIndex({ index, animated: true });
      setActiveIndex(index);
    } catch {
      flatListRef.current?.scrollToOffset({
        offset: index * SCREEN_WIDTH,
        animated: true,
      });
      setActiveIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        pagingEnabled
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="center"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        renderItem={({ item }) => {
          const imgUrl =
            item.imageUrl ||
            item.image?.url ||
            "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1000&q=80";

          return (
            <View style={styles.pageWrapper}>
              <View style={styles.bannerCard}>
                <Image
                  source={{ uri: imgUrl }}
                  style={styles.bannerImage}
                  contentFit="cover"
                  transition={250}
                />
              </View>
            </View>
          );
        }}
      />

      {/* Pagination Dot Indicators */}
      {banners.length > 1 && (
        <View style={styles.dotsContainer}>
          {banners.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => scrollToBanner(i)}
              activeOpacity={0.7}
              style={[
                styles.dot,
                activeIndex === i ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  pageWrapper: {
    width: SCREEN_WIDTH,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerCard: {
    width: BANNER_WIDTH,
    height: 156,
    borderRadius: THEME.radii.lg,
    overflow: "hidden",
    backgroundColor: "#E2E8F0",
    ...THEME.shadows.sm,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 20,
    backgroundColor: THEME.colors.primary,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: THEME.colors.border,
  },
});

export default BannerCarousel;
