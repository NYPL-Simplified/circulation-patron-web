import theme from "./theme";
/**
 * Takes in the colors from the auth document and returns theme with them
 */

export default function makeCustomTheme(
  colors: {
    primary: string;
    secondary: string;
  } | null
): typeof theme {
  return {
    ...theme,
    colors: {
      ...theme.colors,
      brand: {
        primary: colors?.primary ?? theme.colors.brand.primary,
        secondary: colors?.secondary ?? theme.colors.brand.secondary
      }
    }
  };
}
