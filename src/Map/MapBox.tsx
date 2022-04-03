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

export class MapBox extends React.PureComponent<TProps> {
  private isMouseDown = false;
  private isMouseMoving = false;
  // Point of mousedown before dragging
  private mouseDownPoint = { x: 0, y: 0 };

  // Transformations for map div
  private transforms = {
    x: 0,
    y: 0,
    scale: MIN_SCALE,
  };

  // Part of map that is visible to user
  private viewPort?: TViewPort;

  private wrapRef = React.createRef<HTMLDivElement>();

  private resetMap = () => {
    this.transforms = {
      x: window.innerWidth / 2 - (MAP_SIZE * MIN_SCALE) / 2,
      y: window.innerHeight / 2 - (MAP_SIZE * MIN_SCALE) / 2,
      scale: MIN_SCALE,
    };
    this.updateTransform();
  };

  private onMouseDown: MouseEventHandler = (event) => {
    this.mouseDownPoint.x = event.clientX - this.transforms.x;
    this.mouseDownPoint.y = event.clientY - this.transforms.y;
    this.isMouseDown = true;
  };

  private onMouseMove: MouseEventHandler = (event) => {
    if (this.isMouseDown) {
      const newX = event.clientX - this.mouseDownPoint.x;
      const newY = event.clientY - this.mouseDownPoint.y;
      if (newX !== this.transforms.x || newY !== this.transforms.y) {
        this.transforms.x = newX;
        this.transforms.y = newY;
        this.isMouseMoving = true;
        this.updateTransform();
      }
    }
  };

  private updateTransform = () =>
    window.requestAnimationFrame(() => {
      const el = this.wrapRef.current;
      if (!el) return;

      const { x, y, scale } = this.transforms;
      el.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;

      this.updateViewport();
    });

  private updateViewport = () => {
    const el = this.wrapRef.current;
    if (!el) return;

    const { scale } = this.transforms;

    // Adjust rect for scale
    const rect = Object.fromEntries(
      Object.entries(el.getBoundingClientRect().toJSON()).map(([key, val]) => [
        key,
        (val as number) / scale,
      ])
    );

    const viewPortX = Math.max(-rect.x, 0);
    const viewPortY = Math.max(-rect.y, 0);

    const viewPortHeight =
      Math.min(rect.bottom, window.innerHeight / scale) - Math.max(rect.y, 0);
    const viewPortWidth =
      Math.min(rect.right, window.innerWidth / scale) - Math.max(rect.x, 0);

    this.viewPort = {
      x: viewPortX,
      y: viewPortY,
      height: viewPortHeight,
      width: viewPortWidth,
      mapSize: MAP_SIZE,
      scale,
    };

    this.props.onViewPortChange(this.viewPort);
  };

  private onDragStart: MouseEventHandler = () => {
    return false;
  };

  private onClick: MouseEventHandler = (event) => {
    if (this.viewPort) {
      const inverseScale = 1 / this.viewPort.scale;
      const x = (event.clientX - this.transforms.x) * inverseScale;
      const y = (event.clientY - this.transforms.y) * inverseScale;
      this.props.onClick(x, y, this.viewPort);
    }
  };

  private onMouseUp: MouseEventHandler = (event) => {
    if (!this.isMouseMoving && this.isMouseDown) {
      this.onClick(event);
    }
    this.isMouseMoving = false;
    this.isMouseDown = false;
  };

  private handleWheel: WheelEventHandler = (event) => {
    const el = event.currentTarget as HTMLDivElement;
    if (el) {
      const speed = 1.03;
      const wheelDelta = event.deltaY < 0 ? speed : 1 / speed;

      const newScale = bound(
        this.transforms.scale * wheelDelta,
        MIN_SCALE,
        MAX_SCALE
      );
      const diff = newScale / this.transforms.scale;

      this.transforms.scale *= diff;

      const x = event.clientX;
      const y = event.clientY;
      this.transforms.x = x - (x - this.transforms.x) * diff;
      this.transforms.y = y - (y - this.transforms.y) * diff;

      this.updateTransform();
    }
  };

  private handleWindowResize = debounce(this.resetMap, 300);

  componentDidMount() {
    window.addEventListener("resize", this.handleWindowResize);
    this.resetMap();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleWindowResize);
  }

  render() {
    return (
      <Window>
        <MovableBox
          onMouseDown={this.onMouseDown}
          onMouseUp={this.onMouseUp}
          onMouseMove={this.onMouseMove}
          onDragStart={this.onDragStart}
          onDragEnd={this.onMouseUp}
          onWheel={this.handleWheel}
          style={{ height: MAP_SIZE, width: MAP_SIZE }}
          ref={this.wrapRef}
        >
          {this.props.children}
        </MovableBox>
      </Window>
    );
  }
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
