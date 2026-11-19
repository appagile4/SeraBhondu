import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { THEME } from "../../constants/theme";
import { useLanguage } from "../../hooks/useLanguage";
import { authApi } from "../../services/api";
import googleAuthService from "../../services/googleAuth";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  clearAuthError,
  loginWithEmail,
  loginWithGoogle,
  setAuthModalVisible,
  setEmailPasswordThunk,
  verifyEmailOtpThunk,
  verifyPhoneOtpThunk,
} from "../../store/slices/authSlice";
import { LegalModal, LegalModalType } from "./LegalModal";

WebBrowser.maybeCompleteAuthSession();

type AuthMode =
  | "initial"
  | "phone"
  | "phone_otp"
  | "email"
  | "email_otp"
  | "set_password";

export const AuthModal: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const visible = useAppSelector((state) => state.auth.authModalVisible);
  const authError = useAppSelector((state) => state.auth.error);
  const { t, isBn, logoSource } = useLanguage();

  const [mode, setMode] = useState<AuthMode>("initial");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Legal modal state
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalType, setLegalType] = useState<LegalModalType>("terms");

  // Phone flow (Defaulting to Bangladesh country code +880)
  const [phoneNumber, setPhoneNumber] = useState("+880 ");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneCountdown, setPhoneCountdown] = useState(0);

  // Email flow
  const [emailMode, setEmailMode] = useState<"otp" | "password">("otp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailCountdown, setEmailCountdown] = useState(0);
  const [registrationToken, setRegistrationToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Reset modal state on open/close
  useEffect(() => {
    if (visible) {
      setMode("initial");
      setLocalError(null);
      setLoading(false);
      dispatch(clearAuthError());
    }
  }, [visible]);

  // Timers for countdown
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (phoneCountdown > 0) {
      timer = setTimeout(() => setPhoneCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [phoneCountdown]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (emailCountdown > 0) {
      timer = setTimeout(() => setEmailCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [emailCountdown]);

  const handleClose = () => {
    dispatch(setAuthModalVisible(false));
  };

  const openLegal = (type: LegalModalType) => {
    setLegalType(type);
    setLegalModalVisible(true);
  };

  // Google OAuth Configuration for iOS, Android & Web
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "579629075726-jjvfe63l1p1d0fin67gd57hi9ovn7k4d.apps.googleusercontent.com",
    iosClientId:
      "579629075726-81u49pn8d95lj0sbqc1vaccuisetoemh.apps.googleusercontent.com",
    webClientId:
      "579629075726-d0jh0p7ovcc6pc17bmlnk3i1ho805fli.apps.googleusercontent.com",
    scopes: ["profile", "email"],
    redirectUri: Platform.select({
      ios: "com.googleusercontent.apps.579629075726-81u49pn8d95lj0sbqc1vaccuisetoemh:/oauthredirect",
      android:
        "com.googleusercontent.apps.579629075726-jjvfe63l1p1d0fin67gd57hi9ovn7k4d:/oauth2redirect",
      default: undefined,
    }),
  });

  // Initialize native Google Sign-In SDK
  useEffect(() => {
    googleAuthService.init();
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      handleGoogleAuthSuccess(response);
    } else if (response?.type === "error") {
      setLocalError(
        response.error?.message || "Google sign-in encountered an error.",
      );
      setLoading(false);
    }
  }, [response]);

  const handleGoogleAuthSuccess = async (authResponse: any) => {
    setLoading(true);
    setLocalError(null);
    try {
      const authentication = authResponse?.authentication;
      const params = authResponse?.params;
      const accessToken = authentication?.accessToken || params?.access_token;
      const idToken = authentication?.idToken || params?.id_token;
      const code = params?.code;

      if (!accessToken && !idToken && !code) {
        return;
      }

      let userInfo = null;
      if (accessToken) {
        try {
          const uRes = await fetch("https://www.googleapis.com/userinfo/v2/me", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (uRes.ok) {
            userInfo = await uRes.json();
          }
        } catch (uErr) {
          console.warn("[GoogleAuth] Could not fetch userinfo directly:", uErr);
        }
      }

      await dispatch(
        loginWithGoogle({
          accessToken,
          idToken,
          credential: idToken,
          code,
          userInfo: userInfo
            ? {
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture,
                sub: userInfo.id,
              }
            : undefined,
        }),
      ).unwrap();

      handleClose();
      router.replace("/(tabs)/account" as any);
    } catch (err: any) {
      setLocalError(err || "Google sign-in could not be completed.");
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In Action (Native SDK with browser/development fallback)
  const handleGoogleSignIn = async () => {
    setLocalError(null);
    setLoading(true);

    // 1. Native Google Sign-In SDK (Production iOS and Android builds)
    if (googleAuthService.isAvailable()) {
      try {
        const result = await googleAuthService.signIn();
        if (result.cancelled) {
          setLoading(false);
          return;
        }

        if (!result.success || !result.idToken) {
          setLocalError(result.error || "Google Sign-In failed.");
          setLoading(false);
          return;
        }

        await dispatch(
          loginWithGoogle({
            idToken: result.idToken,
            credential: result.idToken,
            accessToken: result.accessToken,
            userInfo: result.userInfo,
          }),
        ).unwrap();

        handleClose();
        router.replace("/(tabs)/account" as any);
      } catch (err: any) {
        setLocalError(err || "Google authentication failed.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // 2. Web fallback
    if (Platform.OS === "web") {
      try {
        await promptAsync();
      } catch (err: any) {
        setLoading(false);
        setLocalError(err.message || "Failed to launch Google Sign-In.");
      }
      return;
    }

    // 3. Expo Go development notice
    setLoading(false);
    Alert.alert(
      isBn ? "ডেভেলপমেন্ট বিল্ড প্রয়োজন" : "Development Build Required",
      isBn
        ? "Google Sign-In ব্যবহার করতে নেটিভ iOS বা Android বিল্ড প্রয়োজন (npx expo run:ios বা EAS Build)। Expo Go-তে পরীক্ষা করতে Email বা Phone OTP ব্যবহার করুন।"
        : "Google Sign-In uses native iOS / Android frameworks and requires a development build (npx expo run:ios or EAS build). It is not available in standard Expo Go.\n\nYou can continue testing using Email OTP or Phone OTP in Expo Go."
    );
  };

  // Phone: Send OTP
  const handleSendPhoneOtp = async () => {
    const rawNumber = phoneNumber.replace(/\s+/g, "");
    if (!rawNumber || rawNumber.length < 11) {
      setLocalError(t("authErrorInvalidPhone"));
      return;
    }

    setLocalError(null);
    setLoading(true);
    try {
      await authApi.sendPhoneOtp(rawNumber);
      setMode("phone_otp");
      setPhoneCountdown(60);
    } catch (err: any) {
      setLocalError(err.response?.data?.message || "Failed to send SMS OTP");
    } finally {
      setLoading(false);
    }
  };

  // Phone: Verify OTP
  const handleVerifyPhoneOtp = async () => {
    if (!phoneOtp || phoneOtp.length < 4) {
      setLocalError(t("authErrorInvalidOtp"));
      return;
    }

    const rawNumber = phoneNumber.replace(/\s+/g, "");
    setLocalError(null);
    setLoading(true);
    try {
      await dispatch(
        verifyPhoneOtpThunk({ phone: rawNumber, otp: phoneOtp.trim() }),
      ).unwrap();
      handleClose();
      router.replace("/(tabs)/account" as any);
    } catch (err: any) {
      setLocalError(err || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  // Email: Submit
  const handleEmailSubmit = async () => {
    if (!email.trim() || !email.includes("@")) {
      setLocalError(t("authErrorInvalidEmail"));
      return;
    }

    setLocalError(null);
    setLoading(true);

    if (emailMode === "password") {
      if (!password) {
        setLocalError(t("authErrorPasswordRequired"));
        setLoading(false);
        return;
      }
      try {
        await dispatch(
          loginWithEmail({ email: email.trim(), password }),
        ).unwrap();
        handleClose();
        router.replace("/(tabs)/account" as any);
      } catch (err: any) {
        setLocalError(err || "Invalid credentials");
      } finally {
        setLoading(false);
      }
    } else {
      // OTP mode
      try {
        await authApi.sendEmailOtp(email.trim());
        setMode("email_otp");
        setEmailCountdown(60);
      } catch (err: any) {
        setLocalError(
          err.response?.data?.message || "Failed to send Email OTP",
        );
      } finally {
        setLoading(false);
      }
    }
  };

  // Email: Verify OTP
  const handleVerifyEmailOtp = async () => {
    if (!emailOtp || emailOtp.length < 4) {
      setLocalError(t("authErrorInvalidOtp"));
      return;
    }

    setLocalError(null);
    setLoading(true);
    try {
      const result = await dispatch(
        verifyEmailOtpThunk({ email: email.trim(), otp: emailOtp.trim() }),
      ).unwrap();

      if (result.isNewUser) {
        // New user: ask for password to set
        setRegistrationToken(result.registrationToken);
        setMode("set_password");
      } else {
        // Existing user: logged in successfully, route to dashboard
        handleClose();
        router.replace("/(tabs)/account" as any);
      }
    } catch (err: any) {
      setLocalError(err || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  // Email: Set Password (complete registration)
  const handleSetPassword = async () => {
    if (!fullName.trim()) {
      setLocalError(t("authErrorNameRequired"));
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setLocalError(t("authErrorPasswordLength"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError(t("authErrorPasswordMismatch"));
      return;
    }

    setLocalError(null);
    setLoading(true);
    try {
      await dispatch(
        setEmailPasswordThunk({
          registrationToken,
          email: email.trim(),
          password: newPassword,
          name: fullName.trim(),
        }),
      ).unwrap();

      // Successfully set password & registered, route to dashboard
      handleClose();
      router.replace("/(tabs)/account" as any);
    } catch (err: any) {
      setLocalError(err || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const activeError = localError || authError;

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.sheetContainer}
              >
                <View style={styles.handleBar} />

                <View style={styles.header}>
                  <TouchableOpacity
                    onPress={() => {
                      if (mode === "email_otp" || mode === "set_password") {
                        setMode("email");
                        setLocalError(null);
                      } else if (mode === "phone_otp") {
                        setMode("phone");
                        setLocalError(null);
                      } else if (mode !== "initial") {
                        setMode("initial");
                        setLocalError(null);
                      } else {
                        handleClose();
                      }
                    }}
                    style={styles.headerBackBtn}
                  >
                    <Ionicons
                      name={mode === "initial" ? "close" : "arrow-back"}
                      size={22}
                      color={THEME.colors.text}
                    />
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>
                    {mode === "initial"
                      ? t("authWelcomeTitle")
                      : mode === "phone"
                        ? t("authPhoneTitle")
                        : mode === "phone_otp"
                          ? t("authPhoneOtpTitle")
                          : mode === "email"
                            ? t("authEmailTitle")
                            : mode === "email_otp"
                              ? t("authEmailOtpTitle")
                              : t("authSetPasswordTitle")}
                  </Text>
                  <View style={{ width: 32 }} />
                </View>

                <ScrollView
                  contentContainerStyle={styles.content}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  {/* Brand Logo & Slogan */}
                  <View style={styles.branding}>
                    <Image
                      source={logoSource}
                      style={styles.brandLogo}
                      resizeMode="contain"
                    />
                    <Text style={styles.slogan}>{t("authSlogan")}</Text>
                  </View>

                  {/* Error Banner */}
                  {activeError ? (
                    <View style={styles.errorBanner}>
                      <Ionicons
                        name="alert-circle"
                        size={18}
                        color={THEME.colors.danger}
                      />
                      <Text style={styles.errorText}>{activeError}</Text>
                    </View>
                  ) : null}

                  {/* MODE 1: Initial Options */}
                  {mode === "initial" && (
                    <View style={styles.buttonGroup}>
                      {/* Google Sign-in */}
                      <TouchableOpacity
                        style={styles.googleBtn}
                        onPress={handleGoogleSignIn}
                        disabled={loading}
                        activeOpacity={0.85}
                      >
                        <Ionicons
                          name="logo-google"
                          size={20}
                          color="#EA4335"
                        />
                        <Text style={styles.googleBtnText}>
                          {t("authGoogleBtn")}
                        </Text>
                      </TouchableOpacity>

                      {/* Email Option */}
                      <TouchableOpacity
                        style={styles.secondaryActionBtn}
                        onPress={() => {
                          setMode("email");
                          setLocalError(null);
                        }}
                        activeOpacity={0.85}
                      >
                        <Ionicons
                          name="mail-outline"
                          size={20}
                          color={THEME.colors.text}
                        />
                        <Text style={styles.secondaryActionBtnText}>
                          {t("authEmailBtn")}
                        </Text>
                      </TouchableOpacity>

                      {/* Divider: ----- or ----- */}
                      <View style={styles.orDividerContainer}>
                        <View style={styles.orDividerLine} />
                        <Text style={styles.orDividerText}>
                          {isBn ? "অথবা" : "or"}
                        </Text>
                        <View style={styles.orDividerLine} />
                      </View>

                      {/* Phone Number: without color, without border, reduced text size, underline */}
                      <TouchableOpacity
                        style={styles.phoneLinkBtn}
                        onPress={() => {
                          setMode("phone");
                          setLocalError(null);
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="call-outline"
                          size={14}
                          color={THEME.colors.textSecondary}
                        />
                        <Text style={styles.phoneLinkText}>
                          {t("authPhoneBtn")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* MODE 2: Phone Number Input */}
                  {mode === "phone" && (
                    <View style={styles.formContainer}>
                      <Text style={styles.inputLabel}>
                        {t("authMobileNumberLabel")}
                      </Text>
                      <View style={styles.inputWrap}>
                        <Ionicons
                          name="call"
                          size={18}
                          color={THEME.colors.primary}
                        />
                        <TextInput
                          style={styles.textInput}
                          value={phoneNumber}
                          onChangeText={setPhoneNumber}
                          keyboardType="phone-pad"
                          placeholder="+880 1XXXXXXXXX"
                          placeholderTextColor={THEME.colors.textMuted}
                          autoFocus
                        />
                      </View>
                      <Text style={styles.helperText}>
                        {t("authPhoneHelper")}
                      </Text>

                      <TouchableOpacity
                        style={[
                          styles.submitBtn,
                          loading && styles.btnDisabled,
                        ]}
                        onPress={handleSendPhoneOtp}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                          <Text style={styles.submitBtnText}>
                            {t("authSendOtpBtn")}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* MODE 3: Phone OTP Input */}
                  {mode === "phone_otp" && (
                    <View style={styles.formContainer}>
                      <Text style={styles.inputLabel}>
                        {isBn
                          ? `${phoneNumber} ${t("authEnterPhoneOtpLabel")}`
                          : `${t("authEnterPhoneOtpLabel")} ${phoneNumber}`}
                      </Text>
                      <View style={styles.inputWrap}>
                        <Ionicons
                          name="keypad"
                          size={18}
                          color={THEME.colors.primary}
                        />
                        <TextInput
                          style={[
                            styles.textInput,
                            { letterSpacing: 6, fontSize: 18 },
                          ]}
                          value={phoneOtp}
                          onChangeText={setPhoneOtp}
                          keyboardType="number-pad"
                          maxLength={6}
                          placeholder="------"
                          placeholderTextColor={THEME.colors.textMuted}
                          autoFocus
                        />
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.submitBtn,
                          loading && styles.btnDisabled,
                        ]}
                        onPress={handleVerifyPhoneOtp}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                          <Text style={styles.submitBtnText}>
                            {t("authVerifyAndLoginBtn")}
                          </Text>
                        )}
                      </TouchableOpacity>

                      {phoneCountdown > 0 ? (
                        <Text style={styles.resendTimer}>
                          {t("authResendIn")} ({phoneCountdown}{" "}
                          {t("authSeconds")})
                        </Text>
                      ) : (
                        <TouchableOpacity onPress={handleSendPhoneOtp}>
                          <Text style={styles.resendLink}>
                            {t("authResendCodeBtn")}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {/* MODE 4: Email Flow */}
                  {mode === "email" && (
                    <View style={styles.formContainer}>
                      <View style={styles.tabSelector}>
                        <TouchableOpacity
                          style={[
                            styles.tabBtn,
                            emailMode === "otp" && styles.tabBtnActive,
                          ]}
                          onPress={() => setEmailMode("otp")}
                        >
                          <Text
                            style={[
                              styles.tabBtnText,
                              emailMode === "otp" && styles.tabBtnTextActive,
                            ]}
                          >
                            {t("authEmailTabOtp")}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.tabBtn,
                            emailMode === "password" && styles.tabBtnActive,
                          ]}
                          onPress={() => setEmailMode("password")}
                        >
                          <Text
                            style={[
                              styles.tabBtnText,
                              emailMode === "password" &&
                                styles.tabBtnTextActive,
                            ]}
                          >
                            {t("authEmailTabPassword")}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.inputLabel}>
                        {t("authEmailLabel")}
                      </Text>
                      <View style={styles.inputWrap}>
                        <Ionicons
                          name="mail"
                          size={18}
                          color={THEME.colors.primary}
                        />
                        <TextInput
                          style={styles.textInput}
                          value={email}
                          onChangeText={setEmail}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          placeholder="name@example.com"
                          placeholderTextColor={THEME.colors.textMuted}
                          autoFocus
                        />
                      </View>

                      {emailMode === "password" && (
                        <>
                          <Text style={[styles.inputLabel, { marginTop: 12 }]}>
                            {t("authPasswordLabel")}
                          </Text>
                          <View style={styles.inputWrap}>
                            <Ionicons
                              name="lock-closed"
                              size={18}
                              color={THEME.colors.primary}
                            />
                            <TextInput
                              style={styles.textInput}
                              value={password}
                              onChangeText={setPassword}
                              secureTextEntry
                              placeholder={t("authPasswordPlaceholder")}
                              placeholderTextColor={THEME.colors.textMuted}
                            />
                          </View>
                        </>
                      )}

                      <TouchableOpacity
                        style={[
                          styles.submitBtn,
                          loading && styles.btnDisabled,
                        ]}
                        onPress={handleEmailSubmit}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                          <Text style={styles.submitBtnText}>
                            {emailMode === "password"
                              ? t("authLoginBtn")
                              : t("authSendOtpBtn")}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* MODE 5: Email OTP Input */}
                  {mode === "email_otp" && (
                    <View style={styles.formContainer}>
                      <Text style={styles.inputLabel}>
                        {isBn
                          ? `${email} ${t("authEnterEmailOtpLabel")}`
                          : `${t("authEnterEmailOtpLabel")} ${email}`}
                      </Text>
                      <View style={styles.inputWrap}>
                        <Ionicons
                          name="keypad"
                          size={18}
                          color={THEME.colors.primary}
                        />
                        <TextInput
                          style={[
                            styles.textInput,
                            { letterSpacing: 6, fontSize: 18 },
                          ]}
                          value={emailOtp}
                          onChangeText={setEmailOtp}
                          keyboardType="number-pad"
                          maxLength={6}
                          placeholder="------"
                          placeholderTextColor={THEME.colors.textMuted}
                          autoFocus
                        />
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.submitBtn,
                          loading && styles.btnDisabled,
                        ]}
                        onPress={handleVerifyEmailOtp}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                          <Text style={styles.submitBtnText}>
                            {t("authVerifyCodeBtn")}
                          </Text>
                        )}
                      </TouchableOpacity>

                      {emailCountdown > 0 ? (
                        <Text style={styles.resendTimer}>
                          {t("authResendIn")} ({emailCountdown}{" "}
                          {t("authSeconds")})
                        </Text>
                      ) : (
                        <TouchableOpacity onPress={handleEmailSubmit}>
                          <Text style={styles.resendLink}>
                            {t("authResendCodeBtn")}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {/* MODE 6: Set Password & Full Name */}
                  {mode === "set_password" && (
                    <View style={styles.formContainer}>
                      <Text style={styles.inputLabel}>
                        {t("authFullNameLabel")}
                      </Text>
                      <View style={styles.inputWrap}>
                        <Ionicons
                          name="person"
                          size={18}
                          color={THEME.colors.primary}
                        />
                        <TextInput
                          style={styles.textInput}
                          value={fullName}
                          onChangeText={setFullName}
                          placeholder={t("authFullNamePlaceholder")}
                          placeholderTextColor={THEME.colors.textMuted}
                        />
                      </View>

                      <Text style={[styles.inputLabel, { marginTop: 12 }]}>
                        {t("authCreatePasswordLabel")}
                      </Text>
                      <View style={styles.inputWrap}>
                        <Ionicons
                          name="lock-closed"
                          size={18}
                          color={THEME.colors.primary}
                        />
                        <TextInput
                          style={styles.textInput}
                          value={newPassword}
                          onChangeText={setNewPassword}
                          secureTextEntry
                          placeholder={t("authCreatePasswordPlaceholder")}
                          placeholderTextColor={THEME.colors.textMuted}
                        />
                      </View>

                      <Text style={[styles.inputLabel, { marginTop: 12 }]}>
                        {t("authConfirmPasswordLabel")}
                      </Text>
                      <View style={styles.inputWrap}>
                        <Ionicons
                          name="shield-checkmark"
                          size={18}
                          color={THEME.colors.primary}
                        />
                        <TextInput
                          style={styles.textInput}
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          secureTextEntry
                          placeholder={t("authConfirmPasswordPlaceholder")}
                          placeholderTextColor={THEME.colors.textMuted}
                        />
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.submitBtn,
                          loading && styles.btnDisabled,
                        ]}
                        onPress={handleSetPassword}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                          <Text style={styles.submitBtnText}>
                            {t("authCompleteSignUpBtn")}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Legal Disclaimers */}
                  <View style={styles.legalBox}>
                    <Text style={styles.legalNotice}>
                      {t("authLegalTextPrefix")}{" "}
                      <Text
                        style={styles.legalLink}
                        onPress={() => openLegal("terms")}
                      >
                        {t("authTerms")}
                      </Text>{" "}
                      {t("authLegalAnd")}{" "}
                      <Text
                        style={styles.legalLink}
                        onPress={() => openLegal("privacy")}
                      >
                        {t("authPrivacy")}
                      </Text>{" "}
                      {t("authLegalTextSuffix")}
                    </Text>
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Embedded Terms & Privacy Modal */}
      <LegalModal
        visible={legalModalVisible}
        type={legalType}
        onClose={() => setLegalModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: THEME.colors.backdrop,
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: THEME.radii.xl,
    borderTopRightRadius: THEME.radii.xl,
    maxHeight: "88%",
  },
  handleBar: {
    width: 44,
    height: 4,
    backgroundColor: THEME.colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  headerBackBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.colors.text,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  branding: {
    alignItems: "center",
    marginBottom: 20,
  },
  brandLogo: {
    width: 160,
    height: 44,
    marginBottom: 6,
  },
  slogan: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: "500",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.dangerLight,
    padding: 10,
    borderRadius: THEME.radii.md,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: THEME.colors.danger,
    fontSize: 12,
    flex: 1,
    fontWeight: "500",
  },
  buttonGroup: {
    gap: 12,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radii.md,
    height: 48,
    gap: 10,
    ...THEME.shadows.sm,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.colors.text,
  },
  primaryActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.radii.md,
    height: 48,
    gap: 10,
  },
  primaryActionBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  secondaryActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radii.md,
    height: 48,
    gap: 10,
  },
  secondaryActionBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.colors.text,
  },
  orDividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  orDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.colors.border,
  },
  orDividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.textMuted,
    textTransform: "lowercase",
  },
  phoneLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 0,
    paddingVertical: 4,
    gap: 6,
  },
  phoneLinkText: {
    fontSize: 12,
    fontWeight: "500",
    color: THEME.colors.textSecondary,
    textDecorationLine: "underline",
  },
  formContainer: {
    marginTop: 4,
  },
  tabSelector: {
    flexDirection: "row",
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.radii.md,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: THEME.radii.sm,
  },
  tabBtnActive: {
    backgroundColor: "#FFFFFF",
    ...THEME.shadows.sm,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.textMuted,
  },
  tabBtnTextActive: {
    color: THEME.colors.primary,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.colors.text,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radii.md,
    paddingHorizontal: 12,
    height: 46,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: THEME.colors.text,
  },
  helperText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 6,
  },
  submitBtn: {
    backgroundColor: THEME.colors.primary,
    height: 48,
    borderRadius: THEME.radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  resendTimer: {
    textAlign: "center",
    color: THEME.colors.textMuted,
    fontSize: 12,
    marginTop: 14,
  },
  resendLink: {
    textAlign: "center",
    color: THEME.colors.primary,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 14,
  },
  legalBox: {
    marginTop: 22,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderLight,
  },
  legalNotice: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
  legalLink: {
    color: THEME.colors.primary,
    fontWeight: "600",
  },
});
