import truncateString from "../truncate";

test("truncates at correct length and word boundary by default", () => {
  expect(truncateString("1234 67 9", 9)).toBe("1234 67...");
  expect(truncateString("1234 6789", 9)).toBe("1234...");
});

test("ignores word boundary setting if only one word", () => {
  expect(truncateString("123456789", 8)).toBe("12345678...");
});

test("doesn't truncate if string is shorter than len", () => {
  const result = truncateString("123456789", 10);
  expect(result).toBe("123456789");
});

test("adds ellipses", () => {
  const result = truncateString("1234 67 9", 9);
  expect(result).toBe("1234 67...");
});

test("doesn't respect word boundaries when not instructed to", () => {
  const result = truncateString("1234 67 9abc", 10, false);
  expect(result).toBe("1234 67 9a...");
});

test("returns empty string", () => {
  expect(truncateString("", 5)).toBe("");
});
