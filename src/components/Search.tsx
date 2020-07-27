/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import TextInput from "./TextInput";
import Button from "./Button";
import { useActions } from "opds-web-client/lib/components/context/ActionsContext";
import Router from "next/router";
import useTypedSelector from "../hooks/useTypedSelector";
import useLinkUtils from "./context/LinkUtilsContext";
import SvgSearch from "icons/Search";

interface SearchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Search component providing input and
 * search button with styles and defaults. Relies on OWC
 * searchData and fetchSearchDescription
 *
 * 1. fetchSearchDescription whenever the url changes to get searchData
 * 2. use searchData to populate the title and placeholder
 */
const Search: React.FC<SearchProps> = ({ className, ...props }) => {
  const [value, setValue] = React.useState("");
  const searchData = useTypedSelector(state => state?.collection?.data?.search);
  const { actions, dispatch } = useActions();
  const linkUtils = useLinkUtils();

  React.useEffect(() => {
    // fetch the search description
    if (searchData?.url) {
      dispatch(actions.fetchSearchDescription(searchData?.url));
    }
  }, [actions, dispatch, searchData]);

  // show no searchbar if we cannot perform a search
  if (!searchData) return null;

  // handle the search
  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const searchTerms = encodeURIComponent(value);
    const url = searchData?.searchData?.template(searchTerms);
    if (!url) return;
    const link = linkUtils.buildCollectionLink(url);
    Router.push(link.href, link.as);
  };

  return (
    <form
      onSubmit={onSearch}
      className={className}
      role="search"
      sx={{ display: "flex", flexDirection: "row" }}
    >
      <TextInput
        id="search-bar"
        type="search"
        name="search"
        title={searchData?.searchData?.shortName}
        placeholder="Enter an author, keyword, etc..."
        aria-label="Enter search keyword or keywords"
        value={value}
        onChange={e => setValue(e.target.value)}
        sx={{
          borderRight: "none",
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0
        }}
        {...props}
      />
      <Button
        type="submit"
        color="ui.black"
        sx={{
          height: "initial",
          flex: "1 0 auto"
        }}
        iconLeft={SvgSearch}
      >
        Search
      </Button>
    </form>
  );
};

export default Search;
