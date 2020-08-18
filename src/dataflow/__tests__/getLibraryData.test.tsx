import {
  fetchCatalog,
  getCatalogUrl,
  fetchAuthDocument,
  getLibraryData,
  getLibrarySlugs
} from "../getLibraryData";
import getConfigFile from "../getConfigFile";
import fetchMock from "jest-fetch-mock";
import ApplicationError, { PageNotFoundError } from "errors";
import * as env from "utils/env";
import rawCatalog from "test-utils/fixtures/opds-feed";

function setEnv({
  CONFIG_FILE = undefined,
  CIRCULATION_MANAGER_BASE = undefined,
  REGISTRY_BASE = undefined
}: any) {
  (env.CONFIG_FILE as any) = CONFIG_FILE;
  (env.CIRCULATION_MANAGER_BASE as any) = CIRCULATION_MANAGER_BASE;
  (env.REGISTRY_BASE as any) = REGISTRY_BASE;
}

describe("fetchCatalog", () => {
  test("calls fetch with catalog url", async () => {
    fetchMock.mockResponseOnce(rawCatalog);
    const promise = await fetchCatalog("some-url");
    // expect();
  });

  test("Throws error if catalog is not correct format", async () => {
    fetchMock.mockResponseOnce("something invalid");
    const promise = fetchCatalog("a url somewhere");
    await expect(promise).rejects.toThrowError(ApplicationError);
    await expect(promise).rejects.toThrowErrorMatchingSnapshot();
  });

  test("Throws error if fetch fails", async () => {
    fetchMock.mockRejectOnce();
    const promise = fetchCatalog("not a valid url");
    await expect(promise).rejects.toThrowError(ApplicationError);
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Could not fetch catalog at not a valid url"`
    );
  });
});

jest.mock("../getConfigFile");
const mockGetConfigFile = getConfigFile as jest.MockedFunction<
  typeof getConfigFile
>;
mockGetConfigFile.mockResolvedValue({
  somelibrary: "somelibraryurl",
  anotherlib: "anotherliburl"
});

describe("getCatalogUrl", () => {
  test("throws error if there is a library slug and CIRCULATION_MANAGER_BASE", async () => {
    setEnv({ CIRCULATION_MANAGER_BASE: "some-base" });
    const promise = getCatalogUrl("some-slug");
    await expect(promise).rejects.toThrowError(ApplicationError);
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `"App is running with a single Circ Manager, but you're trying to access a multi-library route: some-slug"`
    );
  });

  test("throws PageNotFoundError if running multiple libraries and no slug provided", async () => {
    setEnv({
      CONFIG_FILE: "config-file"
    });
    const promise = getCatalogUrl();
    await expect(promise).rejects.toThrowError(PageNotFoundError);
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Library slug must be provided when running with multiple libraries."`
    );
  });

  test("throws PageNotFoundError if no entry found in config file for library", async () => {
    setEnv({
      CONFIG_FILE: "config-file"
    });
    const promise = getCatalogUrl("not there slug");
    await expect(promise).rejects.toThrowError(PageNotFoundError);
    await expect(promise).rejects.toMatchInlineSnapshot(
      `[Page Not Found Error: No CONFIG_FILE entry for library: not there slug]`
    );
  });

  test("returns url for existing library in config file", async () => {
    setEnv({ CONFIG_FILE: "config-file" });
    const promise = getCatalogUrl("anotherlib");
    await expect(promise).resolves.toBe("anotherliburl");
  });

  test("Works for Registry Base", async () => {
    setEnv({ REGISTRY_BASE: "reg-base" });
    const url = await getCatalogUrl("lib-on-registry");
    expect(url).toBe("http://lib-on-registry");
  });
});
