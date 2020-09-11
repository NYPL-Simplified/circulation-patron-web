/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import TextInput from "./TextInput";
import Button from "./Button";
import Router from "next/router";
import useLinkUtils from "./context/LinkUtilsContext";
import SvgSearch from "icons/Search";
import useSWR from "swr";
import useLibraryContext from "components/context/LibraryContext";

interface SearchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Gets the search description url from library context
 * Fetches the search data. Uses that to display a search bar
 * for the whole catalog root (not per collection)
 */
const Search: React.FC<SearchProps> = ({ className, ...props }) => {
  const [value, setValue] = React.useState("");
  const linkUtils = useLinkUtils();
  const { searchDescriptionUrl } = useLibraryContext();

  // fetch the search description
  const { data } = useSWR(searchDescriptionUrl);

  // show no searchbar if we cannot perform a search
  if (!searchDescriptionUrl) return null;

  // handle the search
  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const searchTerms = encodeURIComponent(value);
    const url = data.template(searchTerms);
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
        title={data.shortName}
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
