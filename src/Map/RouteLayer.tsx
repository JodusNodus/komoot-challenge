import React from "react";
import styled from "styled-components";
import { TViewPort } from "./MapBox";
import { useRouteData } from "./RouteDataContext";
import { TPoint } from "./types";
import { distanceBetweenPoints, latLngToXy } from "./utils";

const POINT_RADIUS = 12;

type TPointWithIndex = { point: TPoint; index: number };

export function RouteLayer({ viewPort }: { viewPort: TViewPort }) {
  const { points } = useRouteData();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const render = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const projectedPoints = points.map(([lat, lng]: TPoint) => {
      let [x, y] = latLngToXy(lat, lng, viewPort.mapSize * viewPort.scale);
      x = x - viewPort.x * viewPort.scale;
      y = y - viewPort.y * viewPort.scale;
      return [x, y] as TPoint;
    });

    drawLine(ctx, projectedPoints);

    let simplifiedPoints = projectedPoints.reduce((acc, point, index) => {
      if (index === 0) return [{ point, index }];
      if (
        distanceBetweenPoints(point, acc[acc.length - 1].point) >
        POINT_RADIUS * 4
      ) {
        return [...acc, { point, index }];
      } else {
        return acc;
      }
    }, [] as TPointWithIndex[]);
    // Always keep firsts and last point in simplified points
    simplifiedPoints = simplifiedPoints
      .slice(0, simplifiedPoints.length - 1)
      .concat({
        index: projectedPoints.length - 1,
        point: projectedPoints[projectedPoints.length - 1],
      });

    for (const {
      index,
      point: [x, y],
    } of simplifiedPoints) {
      let label = (index + 1).toString();
      if (index === 0) {
        label = "A";
      }
      if (index === projectedPoints.length - 1) {
        label = "B";
      }
      drawPoint(ctx, x, y, label);
    }
  };

  React.useEffect(() => {
    window.requestAnimationFrame(render);
  }, [canvasRef.current, viewPort, points]);

  return (
    <Canvas
      ref={canvasRef}
      height={window.innerHeight}
      width={window.innerWidth}
    />
  );
}

const Canvas = styled.canvas`
  position: fixed;
  pointer-events: none;
  top: 0;
  left: 0;
`;

function drawPoint(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string
) {
  ctx.beginPath();
  ctx.arc(x, y, POINT_RADIUS, 0, 2 * Math.PI, false);
  ctx.fillStyle = "#383838";
  ctx.fill();

  ctx.font = `bold ${POINT_RADIUS}px sans-serif`;
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x, y);
}

function drawLine(ctx: CanvasRenderingContext2D, points: TPoint[]) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    ctx.lineTo(p[0], p[1]);
  }
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#1186e8";
  ctx.lineWidth = 5;
  ctx.stroke();
}
