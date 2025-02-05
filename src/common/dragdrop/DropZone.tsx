import styled from "styled-components";
import {
    cloneElement,
    CSSProperties,
    MouseEvent,
    ReactElement,
    useContext,
    useLayoutEffect,
    useMemo,
    useRef,
    useState
} from "react";
import DropContext from "./DropContext.tsx";

const DragOverArea = styled.div`
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 100;
    cursor: move;
    user-select: none;
    
    .ghost-image {
        opacity: 0.6;
        object-fit: contain;
    }
`
const DropZone = ({children}: {children: ReactElement}) => {
    const {isDrag, GhostImage, handleDragOver, handlerDragOut, handleDragEnd, handleDrop, handleWindowEnter} = useContext(DropContext)
    const childRef = useRef<HTMLElement>(null)
    const [cloneStyle, setCloneStyle] = useState<CSSProperties>({
        opacity: 0, zIndex: 150, cursor: 'grabbing', ...(children.props.style || {})
    })

    useLayoutEffect(() => { // 마운트 직후
        if (!childRef.current) return

        if (window.getComputedStyle(childRef.current).position === 'static') {
            setCloneStyle(pre => ({
                ...pre,
                position: 'absolute'
            }))
        }
    }, []);

    const onDragOver = useMemo(() => {
        return {
            onMouseEnter: handleWindowEnter,
            onMouseUp: handleDragEnd,
            onMouseMove: handlerDragOut,
        }
    }, [handleDragEnd, handleWindowEnter, handlerDragOut])

    const onDrop = useMemo(() => {
        return {
            onMouseEnter: handleWindowEnter,
            onMouseUp: (e: MouseEvent<HTMLElement>) => {
                handleDrop(e)
                handleDragEnd(e)
            },
            onMouseMove: handleDragOver
        }
    }, [handleDragEnd, handleDragOver, handleDrop, handleWindowEnter])

    return (<>
        {isDrag?
            <>
                <DragOverArea role={'none'} {...onDragOver}> {/* onMouseMove: 고스트 이미지 좌표 계산, onMouseEnter: 화면 밖에서 들어올 때 */}
                    <GhostImage className={'ghost-image'} />
                </DragOverArea>
                {cloneElement(children, {style: cloneStyle, ...onDrop})}
            </>
            : null}
        {cloneElement(children, {ref: childRef})}
    </>)
}

export default DropZone