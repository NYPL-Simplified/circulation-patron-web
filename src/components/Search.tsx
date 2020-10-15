/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import TextInput from "./TextInput";
import Button from "./Button";
import Router from "next/router";
import SvgSearch from "icons/Search";
import useLibraryContext from "components/context/LibraryContext";
import useLinkUtils from "hooks/useLinkUtils";

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
  const { searchData } = useLibraryContext();
  const linkUtils = useLinkUtils();

  // show no searchbar if we cannot perform a search
  if (!searchData) return null;

  // handle the search
  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const searchTerms = encodeURIComponent(value);
    const url = createSearchUrl(
      searchData.template,
      searchData.url,
      searchTerms
    );
    if (!url) return;
    const link = linkUtils.buildCollectionLink(url);
    Router.push(link);
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
        title={searchData?.shortName}
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

function createSearchUrl(
  templateString: string,
  searchUrl: string,
  query: string
) {
  return new URL(
    templateString.replace("{searchTerms}", query),
    searchUrl
  ).toString();
}

export default Search;
