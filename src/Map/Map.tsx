import debounce from "lodash.debounce";
import React from "react";
import { MapBox } from "./MapBox";
import { RouteLayer } from "./RouteLayer";
import { TileLayer } from "./TileLayer";
import { xyToLatLngOG } from "./utils";
import { useRouteData } from "./RouteDataContext";
import { TViewport } from "./types";

export function Map() {
  const [viewport, setViewport] = React.useState<TViewport>();
  const { setPoints } = useRouteData();
  const routeLayerRef = React.useRef<RouteLayer>(null);

  const setViewportDebounced = React.useCallback(
    debounce((viewport: TViewport) => setViewport(viewport), 50),
    []
  );

  const handleViewportChange = React.useCallback((viewport: TViewport) => {
    routeLayerRef.current?.drawRoute(viewport);
    setViewportDebounced(viewport);
  }, []);

  const handleClick = React.useCallback(
    (x: number, y: number, viewport: TViewport) => {
      setPoints((points) =>
        points.concat([xyToLatLngOG(x, y, viewport.mapSize)])
      );
    },
    []
  );

  return (
    <>
      <MapBox onViewportChange={handleViewportChange} onClick={handleClick}>
        {viewport && <TileLayer viewport={viewport} />}
      </MapBox>
      {viewport && <RouteLayer ref={routeLayerRef} viewport={viewport} />}
    </>
  );
}
