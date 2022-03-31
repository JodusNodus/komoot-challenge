import { TPoint } from "./types";

export const bound = (value: number, lower: number, upper: number) =>
  Math.min(Math.max(value, lower), upper);

export const xyToLatLngOG = (x: number, y: number, mapSize: number): TPoint => {
  const lat =
    ((Math.atan(Math.exp(((mapSize / 2 - y) / mapSize) * (2 * Math.PI))) -
      Math.PI / 4) *
      2) /
    (Math.PI / 180);
  const lng = (x - mapSize / 2) / (mapSize / 360);
  return [lat, lng];
};

export function latLngToXy(
  latitude: number,
  longitude: number,
  mapSize: number
): TPoint {
  const mapWidth = mapSize;
  const mapHeight = mapSize;

  const x = (longitude + 180) * (mapWidth / 360);

  const latRad = (latitude * Math.PI) / 180;

  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = mapHeight / 2 - (mapWidth * mercN) / (2 * Math.PI);
  return [x, y];
}

export function distanceBetweenPoints(p1: TPoint, p2: TPoint) {
  let x = p2[0] - p1[0];
  let y = p2[1] - p1[1];
  return Math.sqrt(y * y + x * x);
}