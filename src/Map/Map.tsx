import debounce from "lodash.debounce";
import React from "react";
import { ROUTE } from "./data";
import { MapBox, TViewPort } from "./MapBox";
import { RouteLayer } from "./RouteLayer";
import { TileLayer } from "./TileLayer";
import { TPoint } from "./types";
import { xyToLatLngOG } from "./utils";

const ROUTE_POINTS = ROUTE.features.flatMap((feature) =>
  feature.geometry.coordinates
    .map(([lng, lat]) => [lat, lng] as TPoint)
    .filter((x, i) => i % 100 === 0)
);

export function Map() {
  const [viewPort, setViewPort] = React.useState<TViewPort>();
  const [points, setPoints] = React.useState<TPoint[]>(ROUTE_POINTS);

  const handleViewPortChange = React.useCallback(
    debounce(
      (viewport: TViewPort) =>
        window.requestAnimationFrame(() => setViewPort(viewport)),
      300
    ),
    []
  );

  const handleClick = React.useCallback(
    (x: number, y: number, viewport: TViewPort) => {
      setPoints((points) =>
        points.concat([xyToLatLngOG(x, y, viewport.mapSize)])
      );
    },
    []
  );

  return (
    <>
      <MapBox onViewPortChange={handleViewPortChange} onClick={handleClick}>
        {viewPort && <TileLayer viewPort={viewPort} />}
      </MapBox>
      {viewPort && <RouteLayer viewPort={viewPort} points={points} />}
    </>
  );
}
