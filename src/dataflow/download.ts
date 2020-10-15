import fetchWithHeaders from "dataflow/fetch";
import download from "downloadjs";
import { ServerError } from "errors";
import { OPDS1 } from "interfaces";
import { generateFilename, typeMap } from "utils/file";

export default async function downloadFile(
  url: string,
  title: string,
  type: OPDS1.AnyBookMediaType,
  token?: string
) {
  const response = await fetchWithHeaders(url, token);
  if (response.ok) {
    return downloadBlob(response, title, type);
  }

  /**
   * If the response errored after a redirect, try again
   * without the Authorization header, as it causes errors when
   * redirected to Amazon S3
   */
  if (response.redirected) {
    const newResp = await fetch(response.url);
    if (newResp.ok) {
      return downloadBlob(newResp, title, type);
    }
    throw new ServerError(response.url, newResp.status, await newResp.json());
  }

  const details = await response.json();
  throw new ServerError(url, response.status, details);
}

async function downloadBlob(
  response: Response,
  title: string,
  type: OPDS1.AnyBookMediaType
) {
  const blob = await response.blob();
  const extension = typeMap[type]?.extension ?? "";
  download(blob, generateFilename(title ?? "untitled", extension), type);
}
