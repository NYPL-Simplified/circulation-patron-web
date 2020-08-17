import { existsSync, readFileSync } from "fs";
import { AppSetupError } from "errors";
import getConfigFile from "dataflow/getConfigFile";
import fetchMock from "jest-fetch-mock";

jest.mock("fs");
const mockedExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;
const mockedReadFileSync = readFileSync as jest.MockedFunction<
  typeof readFileSync
>;

test("Throws AppSetupError when no config file found", async () => {
  mockedExistsSync.mockReturnValue(false);
  await expect(getConfigFile("doesnt exist")).rejects.toThrowError(
    AppSetupError
  );
});

test("returns parsed config file", async () => {
  mockedExistsSync.mockReturnValue(true);
  mockedReadFileSync.mockReturnValue(`
  # this is a comment
  mylib|myliburl
  # another comment
  anotherlib|anotherliburl
  `);

  await expect(getConfigFile("anywhere")).resolves.toEqual({
    mylib: "myliburl",
    anotherlib: "anotherliburl"
  });
});

test("attempts to fetch config file when it starts with http", async () => {
  fetchMock.mockResponseOnce(
    "# this is a comment\nmylib|myliburl\n# another comment\nanotherlib|anotherliburl\n\nfetchedlib|fetchedliburl"
  );
  await expect(getConfigFile("http://internet")).resolves.toEqual({
    mylib: "myliburl",
    anotherlib: "anotherliburl",
    fetchedlib: "fetchedliburl"
  });

  expect(fetchMock).toHaveBeenCalledWith("http://internet");
});

test("parser removes empty lines", async () => {
  fetchMock.mockResponseOnce(
    "# this is a comment\nanotherlib|anotherliburl \n"
  );
  const config = getConfigFile("http://internet");
  expect(Object.keys(await config)).toHaveLength(1);
});

test("Throws error when fetch fails for http config file", async () => {
  fetchMock.mockRejectOnce();
  await expect(getConfigFile("http://internet")).rejects.toThrow(
    "Could not fetch config file at: http://internet"
  );

  expect(fetchMock).toHaveBeenCalledWith("http://internet");
});
