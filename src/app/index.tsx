import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { THEME } from "../constants/theme";
import { useLanguage } from "../hooks/useLanguage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const LOGO_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 320);
const LOGO_HEIGHT = LOGO_WIDTH / 2;

const SplashScreen = () => {
  const router = useRouter();
  const { logoSource, t } = useLanguage();

  // Entrance and loader animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entrance animation: Smooth fade, gentle scale up, and upward glide
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // 2. Smooth 3-second loader bar progression
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();

    // 3. Automatically navigate to (tabs) after 3 seconds
    const timer = setTimeout(() => {
      router.replace("/(tabs)" as any);
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, translateYAnim, progressAnim, router]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Main Center Area with Animated Brand Image */}
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
            },
          ]}
        >
          <Image
            source={logoSource}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Minimalist 3-Second Loading Track */}
        <Animated.View style={[styles.progressTrack, { opacity: fadeAnim }]}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth,
              },
            ]}
          />
        </Animated.View>
      </View>

      {/* Bottom Subtle Branding */}
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <Text style={styles.footerBrand}>
          {t("splashBrand", "বাংলাদেশের সেরা মার্কেটপ্লেস")}
        </Text>
        <Text style={styles.footerVersion}>
          {t("splashVersion", "সংস্করণ ১.০.০")}
        </Text>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 50,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    width: "100%",
  },
  logoContainer: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  progressTrack: {
    width: 140,
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 36,
  },
  progressBar: {
    height: "100%",
    backgroundColor: THEME.colors.primary,
    borderRadius: 2,
  },
  footer: {
    alignItems: "center",
    gap: 4,
  },
  footerBrand: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.colors.textMuted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  footerVersion: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: "500",
  },
});
