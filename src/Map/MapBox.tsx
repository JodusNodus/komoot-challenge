import React, { MouseEventHandler, WheelEventHandler } from "react";
import styled from "styled-components";
import { bound } from "./utils";

type TProps = {
  onViewPortChange: (viewport: TViewPort) => void;
  children?: React.ReactNode;
};

export type TViewPort = {
  x: number;
  y: number;
  height: number;
  width: number;
  mapSize: number;
  scale: number;
};

const MIN_SCALE = 0.01;
const MAP_SIZE = Math.pow(2, 18);
const MAX_SCALE = 50;

export function MapBox(props: TProps) {
  const mapSize = React.useMemo(() => MAP_SIZE, []);
  const isMouseDown = React.useRef(false);

  const diffs = React.useRef({ x: 0, y: 0 });
  const transforms = React.useRef({
    x: window.innerWidth / 2 - (mapSize * MIN_SCALE) / 2,
    y: window.innerHeight / 2 - (mapSize * MIN_SCALE) / 2,
    scale: MIN_SCALE,
  });

  const onMouseDown: MouseEventHandler = (event) => {
    diffs.current.x = event.clientX - transforms.current.x;
    diffs.current.y = event.clientY - transforms.current.y;
    isMouseDown.current = true;
  };

  const onMouseMove: MouseEventHandler = function (event) {
    const el = event.currentTarget as HTMLDivElement;
    if (isMouseDown.current) {
      transforms.current.x = event.pageX - diffs.current.x;
      transforms.current.y = event.pageY - diffs.current.y;
      updateTransform(el);
    }
  };

  const updateTransform = (el: HTMLDivElement) =>
    window.requestAnimationFrame(() => {
      const { x, y, scale } = transforms.current;
      el.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;

      const rect = el.getBoundingClientRect().toJSON();
      rect.x /= scale;
      rect.y /= scale;
      rect.height /= scale;
      rect.width /= scale;
      rect.right /= scale;
      rect.bottom /= scale;

      const viewPortX = Math.max(-rect.x, 0);
      const viewPortY = Math.max(-rect.y, 0);

      const viewPortHeight =
        Math.min(rect.bottom, window.innerHeight / scale) - Math.max(rect.y, 0);
      const viewPortWidth =
        Math.min(rect.right, window.innerWidth / scale) - Math.max(rect.x, 0);

      const viewport = {
        x: viewPortX,
        y: viewPortY,
        height: viewPortHeight,
        width: viewPortWidth,
        mapSize,
        scale,
      };

      props.onViewPortChange(viewport);
    });

  const onDragStart: MouseEventHandler = () => {
    return false;
  };

  const onMouseUp: MouseEventHandler = () => {
    isMouseDown.current = false;
  };

  const handleWheel: WheelEventHandler = (event) => {
    const el = event.currentTarget as HTMLDivElement;
    if (el) {
      const x = event.clientX;
      const y = event.clientY;
      const speed = 1.03;
      const wheelDelta = event.deltaY > 0 ? speed : 1 / speed;

      const newScale = bound(
        transforms.current.scale * wheelDelta,
        MIN_SCALE,
        MAX_SCALE
      );
      const diff = newScale / transforms.current.scale;

      transforms.current.scale *= diff;
      transforms.current.x = x - (x - transforms.current.x) * diff;
      transforms.current.y = y - (y - transforms.current.y) * diff;

      updateTransform(el);
    }
  };

  const wrapRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (wrapRef.current) updateTransform(wrapRef.current);
  }, [wrapRef.current]);

  return (
    <Window>
      <MovableBox
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        onDragStart={onDragStart}
        onDragEnd={onMouseUp}
        onWheel={handleWheel}
        style={{ height: mapSize, width: mapSize }}
        ref={wrapRef}
      >
        {props.children}
      </MovableBox>
    </Window>
  );
}

const Window = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
`;

const MovableBox = styled.div`
  display: flex;
  flex-wrap: wrap;
  position: absolute;
  cursor: grab;
  transform-origin: 0 0;
  background-color: lightgrey;
  border: 1px solid gray;
`;
