/**
 * A simple wrapper around fetch to be used across the whole
 * application. It sets the apropriate headers
 */

export default async function fetchWithHeaders(url: string, token?: string) {
  const headers = prepareHeaders(token);
  return await fetch(url, { headers });
}

function prepareHeaders(token?: string) {
  const headers: {
    [key: string]: string;
  } = {
    "X-Requested-With": "XMLHttpRequest"
  };
  if (token) {
    headers["Authorization"] = token;
  }
  return headers;
}
