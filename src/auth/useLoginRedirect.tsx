import extractParam from "dataflow/utils";
import useLinkUtils from "hooks/useLinkUtils";
import { useRouter } from "next/router";

export default function useLoginRedirectUrl() {
  const { buildMultiLibraryLink } = useLinkUtils();
  const { query } = useRouter();

  const catalogRootUrl = buildMultiLibraryLink("/");
  const nextUrl = extractParam(query, "nextUrl");
  const redirectUrl = `${window.location.origin}${nextUrl ?? catalogRootUrl}`;

  return redirectUrl;
}
