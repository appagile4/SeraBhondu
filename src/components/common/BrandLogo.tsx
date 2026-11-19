import React from "react";
import { Image, ImageProps, ImageStyle, StyleProp } from "react-native";
import { useLanguage } from "../../hooks/useLanguage";

export interface BrandLogoProps extends Omit<ImageProps, "source"> {
  style?: StyleProp<ImageStyle>;
}

/**
 * Standard Serabondhu Brand Logo component.
 * Automatically switches between `e-logo.png` (English) and `b-logo.png` (Bangla)
 * based on the active global Redux language state (defaults to Bangla).
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  style,
  resizeMode = "contain",
  ...rest
}) => {
  const { logoSource } = useLanguage();

  return (
    <Image
      source={logoSource}
      style={style}
      resizeMode={resizeMode}
      {...rest}
    />
  );
};

export default BrandLogo;
