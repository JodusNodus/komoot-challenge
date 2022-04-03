import React from "react";
import styled from "styled-components";
import { TViewport } from "./types";
import { bound } from "./utils";

const TILE_SIZE = 256;

type TProps = {
  viewport: TViewport;
};

export function TileLayer({ viewport }: TProps) {
  const mapTilesFit = Math.floor(viewport.mapSize * viewport.scale) / TILE_SIZE;
  const zoom = bound(Math.ceil(Math.log2(mapTilesFit - 3)), 4, 18);

  const divider = Math.pow(2, zoom);
  const size = viewport.mapSize / divider;

  const startTileX = Math.floor(viewport.x / size);
  const endTileX = bound(
    Math.ceil((viewport.x + viewport.width) / size),
    0,
    divider
  );
  const startTileY = Math.floor(viewport.y / size);
  const endTileY = bound(
    Math.ceil((viewport.y + viewport.height) / size),
    0,
    divider
  );

  const horizontalTiles = endTileX - startTileX;
  const verticalTiles = endTileY - startTileY;

  const tiles = React.useMemo(() => {
    if (!(horizontalTiles * verticalTiles)) return [];
    return new Array(horizontalTiles * verticalTiles).fill(0).map((_, i) => {
      const x = startTileX + (i % horizontalTiles);
      const y = startTileY + Math.floor(i / horizontalTiles);

      const path = `${zoom}/${x}/${y}`;

      return (
        <TileImg
          key={path}
          style={{
            height: TILE_SIZE,
            width: TILE_SIZE,
            transform: `translate(${x * size}px, ${y * size}px) scale(${
              size / TILE_SIZE
            })`,
          }}
          loading="lazy"
          draggable="false"
          src={`https://tile.openstreetmap.org/${path}.png`}
        />
      );
    });
  }, [viewport]);

  return <>{tiles}</>;
}

const TileImg = styled.img`
  user-select: none;
  position: absolute;
  transform-origin: 0 0;
  top: 0;
  left: 0;
  user-select: none;
  -webkit-user-drag: none;
`;
