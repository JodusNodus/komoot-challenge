import debounce from "lodash.debounce";
import React, { MouseEventHandler, WheelEventHandler } from "react";
import styled from "styled-components";
import { PANEL_WIDTH } from "../Panel/Panel";
import { TViewport } from "./types";
import { bound, latLngToXy } from "./utils";

type TProps = {
  onViewportChange: (viewport: TViewport) => void;
  onClick: (x: number, y: number, viewport: TViewport) => void;
  children?: React.ReactNode;
};

const MIN_SCALE = 0.01;
const DEFAULT_SCALE = 0.04;
const MAP_SIZE = Math.pow(2, 18);
const MAX_SCALE = 50;
const KOMOOT_OFFICE = [52.3878978, 13.0582401];

export class MapBox extends React.PureComponent<TProps> {
  private isMouseDown = false;
  private isMouseMoving = false;
  // Point of mousedown before dragging
  private mouseDownPoint = { x: 0, y: 0 };

  // Transformations for map div
  private transforms = {
    x: 0,
    y: 0,
    scale: DEFAULT_SCALE,
  };

  // Part of map that is visible to user
  private viewport?: TViewport;

  private wrapRef = React.createRef<HTMLDivElement>();

  private resetMap = () => {
    const [x, y] = latLngToXy(
      KOMOOT_OFFICE[0],
      KOMOOT_OFFICE[1],
      MAP_SIZE * DEFAULT_SCALE
    );

    this.transforms = {
      x: window.innerWidth / 2 - x + PANEL_WIDTH / 2,
      y: window.innerHeight / 2 - y,
      scale: DEFAULT_SCALE,
    };
    this.updateTransform();
  };

  private onMouseDown: MouseEventHandler = (event) => {
    this.mouseDownPoint.x = event.clientX - this.transforms.x;
    this.mouseDownPoint.y = event.clientY - this.transforms.y;
    this.isMouseDown = true;
  };

  private onMouseMove = (event: MouseEvent) => {
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

    const viewportX = Math.max(-rect.x, 0);
    const viewportY = Math.max(-rect.y, 0);

    const viewportHeight =
      Math.min(rect.bottom, window.innerHeight / scale) - Math.max(rect.y, 0);
    const viewportWidth =
      Math.min(rect.right, window.innerWidth / scale) - Math.max(rect.x, 0);

    this.viewport = {
      x: viewportX,
      y: viewportY,
      height: viewportHeight,
      width: viewportWidth,
      mapSize: MAP_SIZE,
      scale,
    };

    this.props.onViewportChange(this.viewport);
  };

  private onClick = (event: MouseEvent) => {
    if (this.viewport) {
      const inverseScale = 1 / this.viewport.scale;
      const x = (event.clientX - this.transforms.x) * inverseScale;
      const y = (event.clientY - this.transforms.y) * inverseScale;
      this.props.onClick(x, y, this.viewport);
    }
  };

  private onMouseUp = (event: MouseEvent) => {
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
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mouseup", this.onMouseUp);
    this.resetMap();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleWindowResize);
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseup", this.onMouseUp);
  }

  render() {
    return (
      <Window>
        <MovableBox
          onMouseDown={this.onMouseDown}
          onWheel={this.handleWheel}
          style={{ height: MAP_SIZE, width: MAP_SIZE }}
          ref={this.wrapRef}
          draggable="false"
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
  background-color: #edf0d5;
`;
