import React from "react";
import styled from "styled-components";
import { RouteDataContext } from "./RouteDataContext";
import { TPoint, TViewport } from "./types";
import { latLngToXy, pointIndexToLabel } from "./utils";

type TProps = { viewport: TViewport };

export class RouteLayer extends React.PureComponent<TProps> {
  private canvasRef = React.createRef<HTMLCanvasElement>();

  static contextType = RouteDataContext;
  context!: React.ContextType<typeof RouteDataContext>;

  public drawRoute = (viewport: TViewport) =>
    window.requestAnimationFrame(() => {
      const { points } = this.context;
      const canvas = this.canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!points.length) return;

      // Project coordinates onto map
      const projectedPoints = points.map(([lat, lng]: TPoint) => {
        let [x, y] = latLngToXy(lat, lng, viewport.mapSize * viewport.scale);
        x = x - viewport.x * viewport.scale;
        y = y - viewport.y * viewport.scale;
        return [x, y] as TPoint;
      });

      drawLine(ctx, projectedPoints);

      const pointsWidthIndex = projectedPoints.map((point, index) => ({
        point,
        index,
      }));

      for (const {
        index,
        point: [x, y],
      } of pointsWidthIndex.reverse()) {
        if (index === 0 || index === pointsWidthIndex.length - 1) {
          drawPoint(
            ctx,
            x,
            y,
            pointIndexToLabel(index, projectedPoints.length)
          );
        } else if (viewport.scale > 8) {
          drawPoint(
            ctx,
            x,
            y,
            pointIndexToLabel(index, projectedPoints.length)
          );
        } else if (viewport.scale > 3) {
          drawSmallPoint(ctx, x, y);
        }
      }
    });

  componentDidUpdate() {
    this.drawRoute(this.props.viewport);
  }

  componentDidMount() {
    this.drawRoute(this.props.viewport);
  }

  render() {
    return (
      <Canvas
        ref={this.canvasRef}
        height={window.innerHeight}
        width={window.innerWidth}
      />
    );
  }
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
  const radius = 12;
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = "#383838";
  ctx.fill();

  ctx.font = `bold ${radius}px sans-serif`;
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x, y);
}

function drawSmallPoint(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath();
  const radius = 6;
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = "#383838";
  ctx.fill();
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
