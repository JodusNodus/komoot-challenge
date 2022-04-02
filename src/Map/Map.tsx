import debounce from "lodash.debounce";
import React from "react";
import { MapBox, TViewPort } from "./MapBox";
import { RouteLayer } from "./RouteLayer";
import { TileLayer } from "./TileLayer";
import { xyToLatLngOG } from "./utils";
import { useRouteData } from "./RouteDataContext";

export function Map() {
  const [viewPort, setViewPort] = React.useState<TViewPort>();
  const { setPoints } = useRouteData();

  const handleViewPortChange = React.useCallback(
    debounce(
      (viewport: TViewPort) =>
        window.requestAnimationFrame(() => setViewPort(viewport)),
      50
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
      {viewPort && <RouteLayer viewPort={viewPort} />}
    </>
  );
}
