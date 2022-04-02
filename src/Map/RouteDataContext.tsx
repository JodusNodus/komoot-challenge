import React from "react";
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

export function RouteDataProvider({ children }: { children: React.ReactNode }) {
  const [points, setPoints] = React.useState<TPoint[]>([]);

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
