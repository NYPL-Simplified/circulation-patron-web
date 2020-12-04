/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { useInView } from "react-intersection-observer";

interface LLImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

/**
 * Renders an image tag with the provided props and adds an intersection observer to handle
 * lazy-loading of the image.  The image tag will have no "src" attribute until at least one
 * pixel of the image becomes visible in the viewport.
 * @param LLImgProps - extends from the default img tag props so that we can eventually add the ability for the developer to pass in a custom root element
 */

const LazyLoadImage: React.FC<LLImgProps> = LLImgProps => {
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true
  });
  const { src, alt, ...otherProps } = LLImgProps;
  return (
    <img
      ref={ref}
      src={inView ? src : undefined}
      data-src={src}
      alt={alt}
      {...otherProps}
    />
  );
};
export default LazyLoadImage;
