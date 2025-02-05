import {ComponentPropsWithoutRef, createContext, MouseEvent, ReactElement} from "react";

export interface DropContextType {
    isDrag: boolean
    GhostImage: (props?: ComponentPropsWithoutRef<'img'>) => ReactElement
    handleDragStart: (e: MouseEvent<HTMLElement>)=>void
    handleDragOver: (e: MouseEvent<HTMLElement>)=>void
    handlerDragOut: (e: MouseEvent<HTMLElement>)=>void
    handleDragEnd: (e: MouseEvent<HTMLElement>)=>void
    handleDrop: (e: MouseEvent<HTMLElement>)=>void
    handleWindowEnter: (e: MouseEvent<HTMLElement>)=>void
}

const DropContext =  createContext<DropContextType>({
    isDrag: false,
    GhostImage: () => <></>,
    handleDragStart: () => {},
    handleDragOver: () => {},
    handlerDragOut: () => {},
    handleDragEnd: () => {},
    handleDrop: () => {},
    handleWindowEnter: () => {},
})

export default DropContext