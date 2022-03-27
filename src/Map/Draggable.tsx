import React, { MouseEventHandler, ReactChild, WheelEventHandler } from "react";
import styled from "styled-components";

type TProps = {
  onViewPortChange: (viewport: TViewPort) => void;
  children?: ReactChild;
};

export type TViewPort = {
  x: number;
  y: number;
  height: number;
  width: number;
  mapSize: number;
};

export function Draggable(props: TProps) {
  const mapSize = React.useMemo(
    () => Math.max(window.innerWidth, window.innerHeight) * 2,
    []
  );
  const isMouseDown = React.useRef(false);

  const diffs = React.useRef({ x: 0, y: 0 });
  const transforms = React.useRef({
    x: window.innerWidth / 2 - mapSize / 2,
    y: window.innerHeight / 2 - mapSize / 2,
    scale: 2,
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

  function updateTransform(el: HTMLDivElement) {
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
    };

    props.onViewPortChange(viewport);
  }

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
      const amount = event.deltaY > 0 ? speed : 1 / speed;
      if (transforms.current.scale * amount < 0.5) {
        return;
      }

      transforms.current.scale *= amount;
      transforms.current.x = x - (x - transforms.current.x) * amount;
      transforms.current.y = y - (y - transforms.current.y) * amount;

      updateTransform(el);
    }
  };

  const wrapRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (wrapRef.current) updateTransform(wrapRef.current);
  }, [wrapRef.current]);

  return (
    <Wrap
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
    </Wrap>
  );
}

const Wrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  position: absolute;
  cursor: grab;
  transform-origin: 0 0;
  background-color: lightgrey;
  border: 1px solid gray;
`;
