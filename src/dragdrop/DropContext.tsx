import {ComponentPropsWithoutRef, createContext, MouseEvent, ReactElement} from "react";

interface WindowEventHandlers {
    onMouseEnter: (e: MouseEvent<HTMLElement>)=>void
    onMouseUp: (e: MouseEvent<HTMLElement>)=>void
    onMouseMove: (e: MouseEvent<HTMLElement>)=>void
}
const defaultWindowEventHandlers: WindowEventHandlers = {
    onMouseEnter: () => {},
    onMouseUp: () => {},
    onMouseMove: () => {},
}

interface DropEventHandlers {
    onMouseEnter: (e: MouseEvent<HTMLElement>)=>void
    onMouseUp: (e: MouseEvent<HTMLElement>)=>void
    onMouseMove: (e: MouseEvent<HTMLElement>)=>void
}
const defaultDropEventHandlers: DropEventHandlers = {
    onMouseEnter: () => {},
    onMouseUp: () => {},
    onMouseMove: () => {},
}

interface DragStartEventHandlers {
    onMouseDown: (e: MouseEvent<HTMLElement>)=>void
    onMouseUp: (e: MouseEvent<HTMLElement>)=>void
    onMouseLeave: (e: MouseEvent<HTMLElement>)=>void
}
const defaultDragStartEventHandlers: DragStartEventHandlers = {
    onMouseDown: () => {},
    onMouseUp: () => {},
    onMouseLeave: () => {},
}

export interface DropContextType {
    isDrag: boolean
    GhostImage: (props?: ComponentPropsWithoutRef<'img'>) => ReactElement
    handleWindowEvent: WindowEventHandlers
    handleDropEvent: DropEventHandlers
    handleDragStartEvent: DragStartEventHandlers
}

const DropContext =  createContext<DropContextType>({
    isDrag: false,
    GhostImage: () => <></>,
    handleWindowEvent: defaultWindowEventHandlers,
    handleDropEvent: defaultDropEventHandlers,
    handleDragStartEvent: defaultDragStartEventHandlers
})

export default DropContext