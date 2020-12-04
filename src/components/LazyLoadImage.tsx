/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";

const LazyLoadImage = ({src, ...otherProps}) => {
    return (
        <img {...otherProps} data-src={src}/>
    );
}
export default LazyLoadImage;
