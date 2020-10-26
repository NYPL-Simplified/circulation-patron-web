/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import useLibraryContext from "components/context/LibraryContext";
import useUser from "components/context/UserContext";
import { fetchBook } from "dataflow/opds1/fetch";
import { ServerError } from "errors";
import Button from "components/Button";
import { Text } from "components/Text";
import track from "analytics/track";

const CancelOrReturn: React.FC<{
  text: string;
  loadingText: string;
  url: string | null;
  id: string;
}> = ({ text, loadingText, url, id }) => {
  const { token, setBook } = useUser();
  const { catalogUrl } = useLibraryContext();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function cancelReservation(revokeUrl: string) {
    if (!token) {
      setError("You must be signed in.");
      return;
    }
    setLoading(true);
    try {
      const newBook = await fetchBook(revokeUrl, catalogUrl, token);
      setBook(newBook, id);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      track.error(e);
      if (e instanceof ServerError) {
        setError(e.info.detail);
        return;
      }
      setError("An unknown error occurred");
    }
  }
  if (!url) return null;
  return (
    <>
      <Button
        onClick={() => cancelReservation(url)}
        loading={loading}
        loadingText={loadingText}
        // size="lg"
        variant="ghost"
        color="ui.gray.light"
        sx={{
          bg: "ui.gray.light",
          color: "ui.gray.dark",
          "&:hover,&:focus": { color: "ui.gray.dark" }
        }}
      >
        <Text variant="text.body.bold">{text}</Text>
      </Button>
      {error && <Text>Error: {error}</Text>}
    </>
  );
};

export default CancelOrReturn;
