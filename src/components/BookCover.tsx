/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { BookData, BookMedium } from "opds-web-client/lib/interfaces";
import { AspectImage } from "@theme-ui/components";
import { getMedium } from "opds-web-client/lib/utils/book";
import { Book, Headset } from "../icons";

/**
 * This is meant to be a book cover. Primarily the image and styling,
 * along with possibly extending it to lazy load the images in the future.
 */

export const bookMediumSvgMap: {
  [key in BookMedium]: React.ReactNode;
} = {
  "http://bib.schema.org/Audiobook": <Headset aria-hidden />,
  "http://schema.org/EBook": <Book aria-hidden />,
  "http://schema.org/Book": <Book aria-hidden />
};

const BookCover: React.FC<{ book: BookData; className?: string }> = ({
  book,
  className
}) => {
  const { imageUrl } = book;
  const medium = getMedium(book);
  const mediumSVG =
    Object.keys(bookMediumSvgMap).indexOf(medium) !== -1
      ? bookMediumSvgMap[medium]
      : null;

  return (
    <div
      className={className}
      sx={{
        border: "1px solid",
        borderColor: "primary",
        borderRadius: 3,
        backgroundColor: "primaries.light",
        overflow: "hidden",
        position: "relative"
      }}
      aria-label={`Cover of book: ${book.title}`}
      role="img"
    >
      <div
        sx={{
          position: "absolute",
          bottom: 0,
          right: 0,
          height: 36,
          width: 36,
          zIndex: 1000,
          backgroundColor: "primaries.dark",
          fill: "white",
          "&>svg": {
            height: "100%",
            width: "100%",
            p: 1
          }
        }}
      >
        {mediumSVG}
      </div>
      <AspectImage
        ratio={2 / 3}
        alt={`Cover of book: ${book.title}`}
        src={imageUrl}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          "::before": {
            backgroundColor: "primaries.light",
            content: '"Book cover image failed to load."',
            position: "absolute",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            top: 0,
            left: 0,
            height: "100%",
            width: "100%"
          }
        }}
      />
    </div>
  );
};

export default BookCover;
