/**
 * This file mocks Date.prototype.toDateString so that it just returns a
 * stub string. This makes code using that function testable across timezones
 * since we can't reliably set the timezone of a node process to something specific.
 */
export const MOCK_DATE_STRING = "mock-date-string";
export const toDateStringSpy = jest
  .spyOn(Date.prototype, "toDateString")
  .mockImplementation(() => MOCK_DATE_STRING);
