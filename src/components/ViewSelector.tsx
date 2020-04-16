/** @jsx jsx */
import { jsx, Flex } from "theme-ui";
import * as React from "react";
import useView from "./context/ViewContext";
import FilterButton from "./FilterButton";
import { Gallery, List } from "../icons";
import useTypedSelector from "../hooks/useTypedSelector";

/**
 * Allows you to choose which view (gallery or list)
 */
const ViewSelector: React.FC = () => {
  const { view, setView } = useView();

  const books = useTypedSelector(state => state.collection.data?.books);

  const hasBooks = (books?.length ?? 0) > 0;

  if (!hasBooks) return null;
  return (
    <Flex
      role="group"
      aria-label="View Selector"
      sx={{ py: 0, fontSize: 5, display: ["none", "flex"] }}
    >
      <FilterButton
        role="radio"
        onClick={() => setView("GALLERY")}
        selected={view === "GALLERY"}
        aria-label="Gallery View"
        aria-checked={view === "GALLERY"}
      >
        <Gallery />
      </FilterButton>
      <FilterButton
        role="radio"
        aria-label="List View"
        aria-checked={view === "LIST"}
        onClick={() => setView("LIST")}
        selected={view === "LIST"}
      >
        <List />
      </FilterButton>
    </Flex>
  );
};
export default ViewSelector;
