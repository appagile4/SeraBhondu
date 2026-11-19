export const THEME = {
  colors: {
    // Serabondhu Brand Palette (Bangladesh Flag Green & Crimson Red)
    primary: "#014923", // Bangladesh Forest Green / Emerald
    primaryDark: "#003318",
    primaryLight: "#E6F4EA",
    primaryMuted: "#0D6335",
    
    accent: "#E30613", // Bangladesh Crimson Red
    accentDark: "#B7000B",
    accentLight: "#FEE2E2",
    accentMuted: "#DC2626",

    navy: "#0A291A",
    emerald: "#059669",

    // Status colors
    success: "#10B981",
    successLight: "#ECFDF5",
    warning: "#F59E0B",
    warningLight: "#FFFBEB",
    danger: "#EF4444",
    dangerLight: "#FEF2F2",
    info: "#0284C7",
    infoLight: "#F0F9FF",

    // Neutrals
    background: "#F8FAFC",
    surface: "#FFFFFF",
    card: "#FFFFFF",
    text: "#0F172A",
    textSecondary: "#475569",
    textMuted: "#94A3B8",
    border: "#E2E8F0",
    borderLight: "#F1F5F9",
    divider: "#F1F5F9",
    backdrop: "rgba(0, 0, 0, 0.65)",
  },
  typography: {
    fontFamily: {
      regular: "System",
      medium: "System",
      semiBold: "System",
      bold: "System",
    },
    sizes: {
      xs: 11,
      sm: 13,
      base: 15,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 28,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  radii: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: "#014923",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: "#014923",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: "#014923",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 6,
    },
  },
};
