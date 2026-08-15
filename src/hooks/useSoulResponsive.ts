import {
  useWindowDimensions,
} from "react-native";

export type SoulScreenSize =
  | "small"
  | "phone"
  | "tablet"
  | "desktop";

export function useSoulResponsive() {
  const {
    width,
    height,
    fontScale,
  } =
    useWindowDimensions();

  let size:
    SoulScreenSize;

  if (width < 350) {
    size = "small";
  } else if (
    width < 768
  ) {
    size = "phone";
  } else if (
    width < 1100
  ) {
    size = "tablet";
  } else {
    size = "desktop";
  }

  return {
    width,

    height,

    fontScale,

    size,

    isSmall:
      size === "small",

    isPhone:
      size === "small" ||
      size === "phone",

    isTablet:
      size === "tablet",

    isDesktop:
      size === "desktop",

    isWide:
      width >= 768,
  };
} 