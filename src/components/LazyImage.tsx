/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { BOOK_HEIGHT } from "./BookCard";
import { useInView } from "react-intersection-observer";

interface LLImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

/**
 * Renders an image tag with the provided props and adds an intersection observer to handle
 * lazy-loading of the image.  The image tag will have no "src" attribute until at least one
 * pixel of the image becomes visible in the viewport.  Note that the viewport has been extended using a rootMargin property so that loading begins offscreen when scrolling vertically.
 * @param LLImgProps - extends from the default img tag props so that we can eventually add the ability for the developer to pass in a custom root element
 */

const LazyImage: React.FC<LLImgProps> = ({ src, alt, ...otherProps }) => {
  const { ref, inView } = useInView({
    rootMargin: `${BOOK_HEIGHT}px 0px`,
    threshold: 0,
    triggerOnce: true
  });
  return (
    <img ref={ref} src={inView ? src : undefined} alt={alt} {...otherProps} />
  );
};
export default LazyImage;
