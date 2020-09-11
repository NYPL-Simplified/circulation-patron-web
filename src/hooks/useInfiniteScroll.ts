import * as React from "react";
import useTypedSelector from "./useTypedSelector";

const useInfiniteScroll = () => {
  const listRef = React.useRef<HTMLUListElement>(null);
  const { dispatch, actions } = useActions();
  const isFetchingPage = useTypedSelector(
    state => state.collection.isFetchingPage
  );
  const nextPageUrl = useTypedSelector(
    state => state.collection.data?.nextPageUrl
  );

  const canFetch = !isFetchingPage && !!nextPageUrl;

  React.useEffect(() => {
    const fetchPage = () =>
      nextPageUrl && dispatch(actions.fetchPage(nextPageUrl));

    const isAtBottom = () => {
      if (!listRef.current) return false;
      const endOfList =
        listRef.current.clientHeight + listRef.current.offsetTop;
      const scrollBottom = window.scrollY + window.innerHeight;

      return scrollBottom >= endOfList;
    };

    const handleScroll = () => {
      if (isAtBottom() && canFetch) {
        fetchPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [canFetch, actions, dispatch, nextPageUrl]);

  return {
    isFetchingPage,
    listRef
  };
};

export default useInfiniteScroll;
