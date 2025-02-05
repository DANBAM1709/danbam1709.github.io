// -------------------- useDrop --------------------
import {useState, MouseEvent} from "react";
import {DragContextType} from "./DragDrop.tsx";

interface DragHandler {
    onDragStart: (e?: MouseEvent<HTMLElement>)=>void
    onDragOver: (e?: MouseEvent<HTMLElement>)=>void
    onDrop: (e?: MouseEvent<HTMLElement>)=>void
}

const useDrop = ({onDragStart, onDragOver, onDrop}: DragHandler): DragContextType => {
    const [isDrag, setIsDrag] = useState<boolean>(false)

    const handleDragStart = (e?: MouseEvent<HTMLElement>) => {
        onDragStart(e)
        setIsDrag(true)
    }

    const handleDragOver = (e?: MouseEvent<HTMLElement>) => {
        if (onDragOver) onDragOver(e)
    }

    const handleDrop = (e?: MouseEvent<HTMLElement>) => {
        onDrop(e)
    }

    return {isDrag, setIsDrag, handleDragStart, handleDragOver, handleDrop}
}

export default useDrop;