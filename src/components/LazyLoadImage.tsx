/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";

type Props = React.ImgHTMLAttributes<HTMLImageElement>;

const LazyLoadImage = React.forwardRef<HTMLImageElement, Props>(
  (props, forwardedRef) => {
    const {src, ...otherProps} = props;
    return(<img ref={forwardedRef} data-src={src} {...otherProps} />)
  }
);
export default LazyLoadImage;
