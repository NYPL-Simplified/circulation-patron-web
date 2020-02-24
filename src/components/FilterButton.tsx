/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { Theme } from "src/theme";
import Button from "./Button";

type FilterButtonProps = { selected: boolean } & React.ComponentProps<
  typeof Button
>;
const FilterButton: React.FC<FilterButtonProps> = ({
  selected,
  children,
  className,
  ...props
}) => {
  const selectedStyles = {
    bg: (theme: Theme) => (selected ? theme.colors.primaries.dark : undefined),
    "&:hover,&:focus": selected
      ? {
          bg: (theme: Theme) => theme.colors.primaries.dark
        }
      : undefined
  };
  return (
    <Button
      className={className}
      sx={{
        height: 40,
        width: 40,
        p: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        mx: 1,
        alignSelf: "flex-end",
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0,
        ...selectedStyles
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default FilterButton;