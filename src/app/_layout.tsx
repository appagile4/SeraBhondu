import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { AuthModal } from "../components/common/AuthModal";
import { LocationModal } from "../components/common/LocationModal";
import { THEME } from "../constants/theme";
import { disconnectSocket, initSocket } from "../services/socket";
import { store } from "../store";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { checkAuthSession } from "../store/slices/authSlice";
import { loadFavourites } from "../store/slices/favouritesSlice";
import { loadSavedCity } from "../store/slices/locationSlice";
import { loadLanguage } from "../store/slices/languageSlice";

function AppContent() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    // Immediately ensure native splash screen is dismissed
    SplashScreen.hideAsync().catch(() => {});

    // Pre-load essential session & persisted user preferences in background
    dispatch(loadLanguage());
    dispatch(checkAuthSession());
    dispatch(loadFavourites());
    dispatch(loadSavedCity());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      initSocket().catch((err) => {
        console.warn("Socket initialization non-fatal:", err);
      });
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated]);

  return (
    <View style={styles.rootContainer}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen
          name="index"
          options={{ headerShown: false, animation: "fade" }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false, animation: "fade" }}
        />
        <Stack.Screen name="listing/[slug]" options={{ headerShown: false }} />
        <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="view-all" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ headerShown: false }} />
        <Stack.Screen name="my-ads" options={{ headerShown: false }} />
        <Stack.Screen name="favourites" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
        <Stack.Screen name="delete-account" options={{ headerShown: false }} />
        <Stack.Screen name="privacy" options={{ headerShown: false }} />
        <Stack.Screen name="terms" options={{ headerShown: false }} />
        <Stack.Screen name="safety-tips" options={{ headerShown: false }} />
      </Stack>

      {/* Global Modals accessible anywhere */}
      <AuthModal />
      <LocationModal />
    </View>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
});
