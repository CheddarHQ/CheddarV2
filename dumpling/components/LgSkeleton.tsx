import React from 'react';
import ContentLoader, { Rect, Circle, Path } from 'react-content-loader/native';

export const MyLoader = (rest: any) => (
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

export const ThisLoader = (props: any) => (
  <ContentLoader
    speed={2}
    width={476}
    height={1000}
    viewBox="0 0 476 1000"
    backgroundColor="#191919"
    foregroundColor="#ecebeb"
    {...props}>
    <Rect x="62" y="5" rx="8" ry="8" width="284" height="19" />
    <Circle cx="31" cy="26" r="25" />
    <Rect x="63" y="31" rx="8" ry="8" width="230" height="16" />
    <Rect x="63" y="65" rx="8" ry="8" width="284" height="19" />
    <Circle cx="32" cy="86" r="25" />
    <Rect x="64" y="91" rx="8" ry="8" width="230" height="16" />
    <Rect x="64" y="128" rx="8" ry="8" width="284" height="19" />
    <Circle cx="33" cy="149" r="25" />
    <Rect x="65" y="154" rx="8" ry="8" width="230" height="16" />
    <Rect x="65" y="188" rx="8" ry="8" width="284" height="19" />
    <Circle cx="34" cy="209" r="25" />
    <Rect x="66" y="214" rx="8" ry="8" width="230" height="16" />
    <Rect x="66" y="248" rx="8" ry="8" width="284" height="19" />
    <Circle cx="35" cy="269" r="25" />
    <Rect x="67" y="274" rx="8" ry="8" width="230" height="16" />
    <Rect x="67" y="308" rx="8" ry="8" width="284" height="19" />
    <Circle cx="36" cy="329" r="25" />
    <Rect x="68" y="334" rx="8" ry="8" width="230" height="16" />
    <Rect x="68" y="371" rx="8" ry="8" width="284" height="19" />
    <Circle cx="37" cy="392" r="25" />
    <Rect x="69" y="397" rx="8" ry="8" width="230" height="16" />
    <Rect x="69" y="431" rx="8" ry="8" width="284" height="19" />
    <Circle cx="38" cy="452" r="25" />
    <Rect x="70" y="457" rx="8" ry="8" width="230" height="16" />
    <Rect x="70" y="490" rx="8" ry="8" width="284" height="19" />
    <Circle cx="39" cy="511" r="25" />
    <Rect x="71" y="516" rx="8" ry="8" width="230" height="16" />
    <Rect x="71" y="550" rx="8" ry="8" width="284" height="19" />
    <Circle cx="40" cy="571" r="25" />
    <Rect x="72" y="576" rx="8" ry="8" width="230" height="16" />
    <Rect x="72" y="613" rx="8" ry="8" width="284" height="19" />
    <Circle cx="41" cy="634" r="25" />
    <Rect x="73" y="639" rx="8" ry="8" width="230" height="16" />
    <Rect x="73" y="673" rx="8" ry="8" width="284" height="19" />
    <Circle cx="42" cy="694" r="25" />
    <Rect x="74" y="699" rx="8" ry="8" width="230" height="16" />
  </ContentLoader>
);
