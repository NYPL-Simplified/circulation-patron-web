/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";

interface LLImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    title?: string;
    showIcon?: boolean;
}

const LazyLoadImage: React.FC<LLImageProps> = ({ title, showIcon, ...props }) => {
    const imageUrl = props.src;
    delete props.src;
    return (
    <img {...props} data-src={imageUrl}/>
  );
};

export default LazyLoadImage;
