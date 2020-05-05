const consoleErrorSpy = jest.spyOn(global.console, "error");

// use this to make console errors fail tests. Useful when running in to issues.
export default function() {
  consoleErrorSpy.mockImplementation((msg, ...opts) => {
    console.warn(msg, ...opts);
    throw new Error(msg);
  });
}
