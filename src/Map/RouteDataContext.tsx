import React from "react";
import { ROUTE } from "./sampleData";
import { TPoint } from "./types";

type TRouteData = {
  points: TPoint[];
  setPoints: React.Dispatch<React.SetStateAction<TPoint[]>>;
};
export const RouteDataContext = React.createContext<TRouteData>({
  points: [],
  setPoints: () => undefined,
});

export const useRouteData = () => React.useContext(RouteDataContext);

const ROUTE_POINTS = ROUTE.features.flatMap((feature) =>
  Array.from(
    new Set(
      feature.geometry.coordinates
        .map(([lng, lat]) => [lat, lng] as TPoint)
        .map((x) => x.join("/"))
    )
  ).map((x) => x.split("/").map((x) => parseFloat(x)) as any)
);

export function RouteDataProvider({ children }: { children: React.ReactNode }) {
  const [points, setPoints] = React.useState<TPoint[]>(ROUTE_POINTS);

  const value = React.useMemo(
    () => ({
      points,
      setPoints,
    }),
    [points]
  );

  return (
    <RouteDataContext.Provider value={value}>
      {children}
    </RouteDataContext.Provider>
  );
}
