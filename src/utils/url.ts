/**
 * Takes a url parameter and encodes it to be suitable
 * for a url
 */
export default function encodeUrlParam(param: string) {
  return encodeURIComponent(param);
}
