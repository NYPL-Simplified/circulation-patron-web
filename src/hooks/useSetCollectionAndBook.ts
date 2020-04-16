import * as React from "react";
import { useParams } from "react-router-dom";
import { SetCollectionAndBook } from "../interfaces";
import useUrlShortener from "../components/context/UrlShortenerContext";
import { useActions } from "opds-web-client/lib/components/context/ActionsContext";
import useAuth from "./useAuth";

/**
 * Currently have to pass in setCollectionAndBook, which we get from
 * redux connect using opds mapStateToProps, mapDispatchToProps and
 * mergeProps. We will look to change this in the future so this
 * hook can be entirely independent
 */
const useSetCollectionAndBook = (
  setCollectionAndBook: SetCollectionAndBook,
  // my-books page has to override this and send in a hard coded collectionUrl
  collectionUrlOverride?: string
) => {
  const { bookUrl, collectionUrl } = useParams();
  const finalCollectionUrl = collectionUrlOverride ?? collectionUrl;
  const { actions, dispatch } = useActions();
  const { isSignedIn } = useAuth();
  const urlShortener = useUrlShortener();

  const fullCollectionUrl = decodeURIComponent(
    urlShortener.expandCollectionUrl(finalCollectionUrl)
  );
  const fullBookUrl = urlShortener.expandBookUrl(bookUrl);
  // set the collection and book whenever the urls change, and fetch loans
  React.useEffect(() => {
    setCollectionAndBook(fullCollectionUrl, fullBookUrl).then(
      ({ collectionData }) => {
        // then fetch the loans (like in OPDS root)
        // but only if you are already signed in. Otherwise you don't need them at this point
        if (collectionData?.shelfUrl && isSignedIn) {
          dispatch(actions.fetchLoans(collectionData.shelfUrl));
        }
      }
    );
    /**
     * We will explicitly not have exhaustive deps here because
     * setCollectionAndBook changes identity on every render, which
     * would cause this to be run every render. We would ideally memoize
     * setCollectionAndBook in opds-web-client, but that would require
     * significant changes. For now we will simply omit it and look out for
     * potential errors when setCollectionAndBook might be initially incorrect
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionUrl, bookUrl, fullCollectionUrl, fullBookUrl]);
};

export default useSetCollectionAndBook;
