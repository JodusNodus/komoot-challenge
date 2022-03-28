import debounce from "lodash.debounce";
import React from "react";
import styled from "styled-components";
import { MapBox, TViewPort } from "./MapBox";
import { TileLayer } from "./TileLayer";

export function Map() {
  const [viewPort, setViewPort] = React.useState<TViewPort>();

  const debouncedSetViewPort = React.useCallback(
    debounce(setViewPort, 400),
    []
  );

  return (
    <MapBox onViewPortChange={debouncedSetViewPort}>
      {viewPort && <TileLayer viewPort={viewPort} />}
    </MapBox>
  );
}
