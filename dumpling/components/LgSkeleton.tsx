import React from 'react';
import ContentLoader, { Rect, Circle, Path } from 'react-content-loader/native';

const MyLoader = (rest: any) => (
  <ContentLoader
    speed={2}
    width={400}
    height={160}
    viewBox="0 0 400 160"
    backgroundColor="#191919"
    foregroundColor="#ecebeb"
    {...rest}>
    <Rect x="15" y="15" rx="4" ry="4" width="350" height="25" />
    <Rect x="15" y="50" rx="2" ry="2" width="350" height="150" />
    <Rect x="15" y="230" rx="2" ry="2" width="170" height="20" />
    <Rect x="60" y="230" rx="2" ry="2" width="170" height="20" />
  </ContentLoader>
);

export default MyLoader;
