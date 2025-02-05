// -------------------- useDrop --------------------
import {
    useState,
    MouseEvent,
    MutableRefObject,
    CSSProperties,
    useMemo,
    ComponentProps, ReactElement,
} from "react";
import {DropContextType} from "./DragDrop.tsx";
import html2canvas from "html2canvas";

interface DragHandler {
    dropTarget: MutableRefObject<HTMLElement|null>
    onDragStart: (e?: MouseEvent<HTMLElement>)=>void
    onDragOver?: (e?: MouseEvent<HTMLElement>)=>void
    onDragOut?: (e?: MouseEvent<HTMLElement>)=>void
    onDrop: (e?: MouseEvent<HTMLElement>)=>void
}

const useDrop = ({dropTarget, onDragStart, onDragOver, onDragOut, onDrop}: DragHandler): DropContextType => {
    const [isDrag, setIsDrag] = useState<boolean>(false)
    const [ghostSrc, setGhostSrc] = useState<string>('') // 고스트 이미지 캡쳐 src
    const [ghostPos, setGhostPos] = useState<{x: number, y: number}>({x: 0, y: 0})
    const ghostStyle: CSSProperties = useMemo(() => {
        return {
            position: 'fixed',
            top: ghostPos.y,
            left: ghostPos.x,
            pointEvents: 'none',
            zIndex: 110,
        }
    }, [ghostPos])

    const getGhostSrc = async () => {
        const canvas = await html2canvas(dropTarget.current!, {scale: 1})
        return canvas.toDataURL()
    }
    const setGhostPosFunc = (e: MouseEvent<HTMLElement>) => {
        setGhostPos({x: e.clientX + 5, y: e.clientY + 5})
    }

    // DragStart
    const handleDragStart = (e: MouseEvent<HTMLElement>) => {
        e.preventDefault()
        getGhostSrc().then(src => setGhostSrc(src))
        onDragStart(e||undefined)
        setIsDrag(true)
    }

    // DragOver
    const handleDragOver = (e: MouseEvent<HTMLElement>) => {
        if (onDragOver) onDragOver(e)
        setGhostPosFunc(e)
    }

    // DragOut
    const handlerDragOut = (e: MouseEvent<HTMLElement>) => {
        if (onDragOut) onDragOut(e)
        setGhostPosFunc(e)
    }

    // DragEnd
    const handleDragEnd = () => {
        setIsDrag(false)
    }

    // Drop
    const handleDrop = (e?: MouseEvent<HTMLElement>) => {
        onDrop(e)
        handlerDragOut(e!)
        handleDragEnd()
    }

    // WindowEnter
    const handleWindowEnter = (e: MouseEvent<HTMLElement>) => {
        if (isDrag && e.buttons === 0) { // 좌측 클릭 상태
            setIsDrag(false)
            return
        }
        setGhostPosFunc(e)
    }

    // GhostImage 컴포
    const GhostImage = (props?: ComponentProps<'img'>): ReactElement => {
        return <img src={ghostSrc} style={ghostStyle} alt={'ghost-image'} {...props} />
    }

    return {isDrag, GhostImage, handleDragStart, handleDragOver, handlerDragOut, handleDragEnd, handleDrop, handleWindowEnter}
}

export default useDrop;