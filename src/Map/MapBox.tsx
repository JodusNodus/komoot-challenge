import debounce from "lodash.debounce";
import React, { MouseEventHandler, WheelEventHandler } from "react";
import styled from "styled-components";
import { bound } from "./utils";

type TProps = {
  onViewPortChange: (viewport: TViewPort) => void;
  onClick: (x: number, y: number, viewport: TViewPort) => void;
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
  const isMouseMoving = React.useRef(false);

  const diffs = React.useRef({ x: 0, y: 0 });
  const transforms = React.useRef({
    x: window.innerWidth / 2 - (mapSize * MIN_SCALE) / 2,
    y: window.innerHeight / 2 - (mapSize * MIN_SCALE) / 2,
    scale: MIN_SCALE,
  });
  const viewPort = React.useRef<TViewPort>();

  const onMouseDown: MouseEventHandler = (event) => {
    diffs.current.x = event.clientX - transforms.current.x;
    diffs.current.y = event.clientY - transforms.current.y;
    isMouseDown.current = true;
  };

  const onMouseMove: MouseEventHandler = function (event) {
    const el = event.currentTarget as HTMLDivElement;

    if (isMouseDown.current) {
      const newX = event.clientX - diffs.current.x;
      const newY = event.clientY - diffs.current.y;
      if (newX !== transforms.current.x || newY !== transforms.current.y) {
        transforms.current.x = newX;
        transforms.current.y = newY;
        isMouseMoving.current = true;
        updateTransform(el);
      }
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

      viewPort.current = {
        x: viewPortX,
        y: viewPortY,
        height: viewPortHeight,
        width: viewPortWidth,
        mapSize,
        scale,
      };

      props.onViewPortChange(viewPort.current);
    });

  const onDragStart: MouseEventHandler = () => {
    return false;
  };

  const onClick: MouseEventHandler = (event) => {
    if (viewPort.current) {
      const inverseScale = 1 / viewPort.current.scale;
      const x = (event.clientX - transforms.current.x) * inverseScale;
      const y = (event.clientY - transforms.current.y) * inverseScale;
      props.onClick(x, y, viewPort.current);
    }
  };

  const onMouseUp: MouseEventHandler = (event) => {
    if (!isMouseMoving.current && isMouseDown.current) {
      onClick(event);
    }
    isMouseMoving.current = false;
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

  const handleResize = React.useCallback(
    debounce(() => {
      if (wrapRef.current) {
        transforms.current = {
          x: window.innerWidth / 2 - (mapSize * MIN_SCALE) / 2,
          y: window.innerHeight / 2 - (mapSize * MIN_SCALE) / 2,
          scale: MIN_SCALE,
        };
        updateTransform(wrapRef.current);
      }
    }, 300),
    []
  );

  React.useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
