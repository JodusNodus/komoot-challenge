import debounce from "lodash.debounce";
import React from "react";
import styled from "styled-components";
import { Draggable, TViewPort } from "./Draggable";
import { TileLayer } from "./TileLayer";

export function Map() {
  const [viewPort, setViewPort] = React.useState<TViewPort>();

  const debouncedSetViewPort = React.useCallback(
    debounce(setViewPort, 400),
    []
  );

  return (
    <Window>
      <Draggable onViewPortChange={debouncedSetViewPort}>
        {viewPort && <TileLayer viewPort={viewPort} />}
      </Draggable>
    </Window>
  );
}

const Window = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
`;
