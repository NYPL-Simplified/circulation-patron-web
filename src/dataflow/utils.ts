import { ParsedUrlQuery } from "querystring";

/**
 * Extracts a string parameter from a url query
 */
export default function extractParam(
  query: ParsedUrlQuery | undefined,
  param: string
): string | undefined {
  const extracted = query?.[param];
  return typeof extracted === "string" ? extracted : undefined;
}
