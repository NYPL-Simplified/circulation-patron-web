/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { AspectRatio } from "@theme-ui/components";
import { MediumIcon } from "./MediumIndicator";
import { BookData } from "interfaces";
/**
 * This is meant to be a book cover. Primarily the image and styling,
 * along with possibly extending it to lazy load the images in the future.
 */

type ImageLoadState = "loading" | "error" | "success";

const BookCover: React.FC<{ book: BookData; className?: string }> = ({
  book,
  className
}) => {
  const [state, setState] = React.useState<ImageLoadState>("loading");
  const { imageUrl } = book;

  const handleError = () => setState("error");
  const handleLoad = () => setState("success");

  return (
    <div
      className={className}
      sx={{
        overflow: "hidden",
        position: "relative",
        "&>div": {
          height: "100%"
        }
      }}
      aria-label={`Cover of book: ${book.title}`}
      role="img"
    >
      <AspectRatio
        ratio={2 / 3}
        sx={{
          width: "100%",
          height: "100%",
          p: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "ui.gray.lightWarm"
        }}
      >
        <MediumIcon book={book} sx={{ height: "30%", fill: "ui.gray.dark" }} />
      </AspectRatio>
      <img
        alt={`Cover of book: ${book.title}`}
        src={imageUrl}
        onError={handleError}
        onLoad={handleLoad}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: state === "success" ? 1 : 0,
          transition: "all 0.1s ease-in"
        }}
      />
    </div>
  );
};

export default BookCover;
