import { darken, alpha } from "@theme-ui/color";

const buttonBase = {
  appearance: "none",
  display: "inline-flex",
  alignItems: "center",
  textAlign: "center",
  lineHeight: "inherit",
  textDecoration: "none",
  fontSize: "inherit",
  fontWeight: "bold",
  m: 0,
  px: 3,
  py: 1,
  border: 0,
  borderRadius: 2,
  cursor: "pointer",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const variants = {
  // variants
  text: {
    bookTitle: {
      fontFamily: "bookTitle",
      fontSize: 3,
      fontWeight: "bold",
      mb: 0,
      mt: 3
    }
  },
  cards: {
    bookDetails: {
      maxWidth: ["none", "none", 800],
      mx: [2, 2, "auto"],
      my: 3
    }
  },
  buttons: {
    primary: {
      ...buttonBase,
      bg: "primary",
      color: "white",
      fill: "white",
      "&:focus,&:hover": {
        bg: darken("primary", 0.05)
      },
      "&:active": {
        bg: darken("primary", 0.1)
      },
      "&:disabled": {
        bg: "disabled",
        cursor: "default"
      }
    },
    accent: {
      ...buttonBase,
      bg: "accent",
      color: "white",
      fill: "white",
      "&:focus,&:hover": {
        bg: darken("accent", 0.05)
      },
      "&:active": {
        bg: darken("accent", 0.1)
      },
      "&:disabled": {
        bg: "disabled",
        cursor: "default"
      }
    },
    flat: {
      ...buttonBase,
      bg: "white",
      color: "blues.dark",
      "&:focus,&:hover": {
        bg: alpha("primary", 0.2)
      },
      "&:active": {
        bg: alpha("primary", 0.4)
      },
      "&:disabled": {
        color: "grey",
        cursor: "default"
      }
    }
  },
  inputs: {
    // select: {
    //   borderRadius: 2,
    //   borderWidth: 2,
    //   p: 1,
    //   fontSize: 2,
    //   width: "100%"
    // }
    select: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      position: "relative",
      pl: 1,
      pr: 2,
      height: "2rem",
      fontSize: 2,
      lineHeight: "normal",
      bg: "white",
      pb: 1,
      // color: inherit;
      transition: "all 0.2s ease 0s",
      //  borderRadius: "0.25rem",
      borderRadius: 2,
      border: "solid",
      borderColor: "primary"
    }
  },
  lists: {
    unstyled: {
      m: 0,
      p: 0,
      "&>li": {
        listStyle: "none"
      }
    }
  }
};
export default variants;
