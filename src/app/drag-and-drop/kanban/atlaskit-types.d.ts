// Type definitions for Atlassian's pragmatic-drag-and-drop direct imports
declare module '@atlaskit/pragmatic-drag-and-drop/dist/esm/entry-point/element/adapter' {
  export interface DraggableOptions {
    element: HTMLElement;
    getData: () => any;
  }

  export interface DropTargetOptions {
    element: HTMLElement;
    canDrop?: (args: { source: { data: any } }) => boolean;
    onDragEnter?: () => void;
    onDragLeave?: () => void;
    onDrop?: (args: { source: { data: any } }) => void;
  }

  export interface MonitorOptions {
    onDragStart?: (args: { source: { element: HTMLElement } }) => void;
    onDrop?: (args: { source: { element: HTMLElement } }) => void;
  }

  export function draggable(options: DraggableOptions): () => void;
  export function dropTargetForElements(options: DropTargetOptions): () => void;
  export function monitorForElements(options: MonitorOptions): () => void;
}

declare module '@atlaskit/pragmatic-drag-and-drop/dist/esm/entry-point/combine' {
  export function combine(...cleanupFunctions: Array<() => void>): () => void;
} 