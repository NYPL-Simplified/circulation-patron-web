import makeTheme from "theme";
import baseTheme from "theme/theme";

test("app sets and uses passed in primary and secondary colors", () => {
  const result = makeTheme({
    primary: "blue",
    secondary: "red"
  });

  expect(result.colors.brand.primary).toBe("blue");
  expect(result.colors.brand.secondary).toBe("red");
});

test("accepts nullish color scheme", () => {
  const result = makeTheme(null);

  expect(result).toEqual(baseTheme);
});
