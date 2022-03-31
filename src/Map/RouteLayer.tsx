import React from "react";
import styled from "styled-components";
import { TViewPort } from "./MapBox";
import { TPoint } from "./types";
import { latLngToXy } from "./utils";

function drawPoint(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  pointNumber: number
) {
  ctx.beginPath();
  const radius = 12;
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = "#383838";
  ctx.fill();

  ctx.font = `bold ${radius}px sans-serif`;
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

    for (let i = 0; i < projectedPoints.length - 1; i++) {
      drawLine(ctx, projectedPoints[i], projectedPoints[i + 1]);
    }

    for (const [i, [x, y]] of projectedPoints.entries()) {
      drawPoint(ctx, x, y, i + 1);
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

// const points = React.useMemo(
//   () =>
//   [viewPort]
// );
// return <>{points}</>;

// import React from "react";
// import styled from "styled-components";
// import { TViewPort } from "./MapBox";
// import { TPoint } from "./types";
// import { latLngToXy } from "./utils";

// export function RouteLayer({
//   viewPort,
//   points,
// }: {
//   viewPort: TViewPort;
//   points: TPoint[];
// }) {
//   const elements = React.useMemo(
//     () =>
//       points.map(([, lng], ind) => {
//         const [x, y] = latLngToXy(lat, lng, viewPort.mapSize);
//         return (
//           <Point
//             key={`${lat}/${lng}/${ind}`}
//             style={{
//               transform: `translate(${x}px, ${y}px) scale(${
//                 1 / viewPort.scale
//               })`,
//             }}
//           />
//         );
//       }),
//     [viewPort, points]
//   );
//   return <>{elements}</>;
// }

// const Point = styled.div`
//   position: absolute;
//   top: 0;
//   left: 0;
//   height: 10px;
//   width: 10px;
//   transform-origin: 0 0;
//   border-radius: 5px;
//   background-color: red;
// `;
