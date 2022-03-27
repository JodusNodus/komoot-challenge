import throttle from "lodash.throttle";
import React from "react";
import styled from "styled-components";
import { Draggable, TViewPort } from "./Draggable";
import { bound } from "./utilts";

export function TileLayer({ viewPort }: { viewPort: TViewPort }) {
  const mapTilesFit = Math.floor(viewPort.mapSize * viewPort.scale) / 256;
  const zoom = Math.ceil(Math.log2(mapTilesFit - 3));

  const divider = Math.pow(2, zoom);
  const size = viewPort.mapSize / divider;

  const startTileX = Math.floor(viewPort.x / size);
  const endTileX = bound(
    Math.ceil((viewPort.x + viewPort.width) / size),
    0,
    divider
  );
  const startTileY = Math.floor(viewPort.y / size);
  const endTileY = bound(
    Math.ceil((viewPort.y + viewPort.height) / size),
    0,
    divider
  );

  const horizontalTiles = endTileX - startTileX;
  const verticalTiles = endTileY - startTileY;

  const tiles = React.useMemo(() => {
    return new Array(horizontalTiles * verticalTiles).fill(0).map((_, i) => {
      const x = startTileX + (i % horizontalTiles);
      const y = startTileY + Math.floor(i / horizontalTiles);

      const path = `${zoom}/${x}/${y}`;

      return (
        <TileImg
          key={path}
          style={{
            height: size,
            width: size,
            transform: `translate(${x * size}px, ${y * size}px)`,
          }}
          loading="lazy"
          draggable="false"
          src={`https://tile.openstreetmap.org/${path}.png`}
        />
      );
    });
  }, [viewPort]);

  return <>{tiles}</>;
}

const TileImg = styled.img`
  user-select: none;
  position: absolute;
  top: 0;
  left: 0;
`;
