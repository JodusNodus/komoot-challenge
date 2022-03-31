import React from "react";
import styled from "styled-components";
import { TViewPort } from "./MapBox";
import { TPoint } from "./types";
import { distanceBetweenPoints, latLngToXy } from "./utils";

const POINT_RADIUS = 12;

type TPointWithIndex = { point: TPoint; index: number };

export function RouteLayer({
  viewPort,
  points,
}: {
  viewPort: TViewPort;
  points: TPoint[];
}) {
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

    const simplifiedPoints = projectedPoints.reduce((acc, point, index) => {
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

    for (let i = 0; i < simplifiedPoints.length - 1; i++) {
      drawLine(ctx, simplifiedPoints[i].point, simplifiedPoints[i + 1].point);
    }

    for (const {
      index,
      point: [x, y],
    } of simplifiedPoints) {
      drawPoint(ctx, x, y, index + 1);
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
  pointNumber: number
) {
  ctx.beginPath();
  ctx.arc(x, y, POINT_RADIUS, 0, 2 * Math.PI, false);
  ctx.fillStyle = "#383838";
  ctx.fill();

  ctx.font = `bold ${POINT_RADIUS}px sans-serif`;
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(pointNumber.toString(), x, y);
}

function drawLine(ctx: CanvasRenderingContext2D, p1: TPoint, p2: TPoint) {
  ctx.beginPath();
  ctx.moveTo(p1[0], p1[1]);
  ctx.lineTo(p2[0], p2[1]);
  ctx.strokeStyle = "#1e68e8";
  ctx.lineWidth = 5;
  ctx.stroke();
}
