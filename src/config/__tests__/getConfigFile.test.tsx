/* eslint-disable camelcase */
import fetchMock from "jest-fetch-mock";
import getAppConfig from "../fetch-config";
const fs = require("fs");

process.cwd = jest.fn(() => "/");

const realExistsSync = fs.existsSync;
const realReadFileSync = fs.readFileSync;

beforeAll(() => {
  fs.existsSync = jest.fn();
  fs.readFileSync = jest.fn();
});
afterAll(() => {
  fs.existsSync = realExistsSync;
  fs.readFileSync = realReadFileSync;
});

test("Throws Error when no config file found on root", async () => {
  fs.existsSync.mockReturnValue(false);
  await expect(
    getAppConfig("./doesnt exist")
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Config file not found at: /doesnt exist"`
  );
});

const mockFile = `
libraries:
  lib1: http://hello.com
media_support:
  application/epub+zip: show
bugsnag_api_key: bug
gtm_id: gtm
axisnow_decrypt: true
companion_app: simplye
  `;

const mockResult = {
  libraries: {
    lib1: "http://hello.com"
  },
  media_support: {
    "application/epub+zip": "show"
  },
  bugsnag_api_key: "bug",
  gtm_id: "gtm",
  axisnow_decrypt: true,
  companion_app: "simplye"
};

test("returns parsed config file", async () => {
  fs.existsSync.mockReturnValue(true);
  fs.readFileSync.mockReturnValue(mockFile);

  const conf = await getAppConfig("anywhere");
  expect(conf).toEqual(mockResult);
});

test("attempts to fetch config file when it starts with http", async () => {
  fetchMock.mockResponseOnce(mockFile);
  await expect(getAppConfig("http://internet")).resolves.toEqual(mockResult);

  expect(fetchMock).toHaveBeenCalledWith("http://internet");
});

test("Throws error when fetch fails for http config file", async () => {
  fetchMock.mockRejectOnce();
  await expect(getAppConfig("http://internet")).rejects.toThrow(
    "Could not fetch config file at: http://internet"
  );

  expect(fetchMock).toHaveBeenCalledWith("http://internet");
});
