import {ComponentProps, CSSProperties, MouseEvent, ReactElement, useEffect, useState,} from "react";
import html2canvas from "html2canvas";
import {DropContextType} from "./DropContext.tsx";
import styled from "styled-components";

const GhostImageStyle = styled.img`
    position: fixed;
    opacity: 0.6;
    object-fit: contain;
    z-index: 99999;
    pointer-events: none !important;
    user-select: none !important;
`

interface DragHandler {
    dropTarget: HTMLElement | null
    onDragStart?: (e?: MouseEvent<HTMLElement>)=>void
    onDragOver?: (e?: MouseEvent<HTMLElement>)=>void
    onDragOut?: (e?: MouseEvent<HTMLElement>)=>void
    onDragEnd?: (e?: MouseEvent<HTMLElement>)=>void
    onDrop: (e?: MouseEvent<HTMLElement>)=>void
}

/**
 * dropTarget: 드롭 장소, onDragStart: 드롭 시작, onDragOver: 드롭 중, onDragOut: 드롭 영역 밖, onDrop: 드롭 완료 <br />
 * 파라미터 함수 정의시 (e?: MouseEvent<HTMLElement>)<br />
 * return isDrag:boolean, ...etc
 */
const useDrop = ({dropTarget, onDragStart, onDragOver, onDragOut, onDragEnd, onDrop}: DragHandler): DropContextType => {
    const  [isClick, setIsClick] = useState<boolean>(false)
    const [isDrag, setIsDrag] = useState<boolean>(false)
    const [ghostSrc, setGhostSrc] = useState<string|null>(null) // 고스트 이미지 캡쳐 src
    const [ghostStyle, setGhostStyle] = useState<CSSProperties>({})

    useEffect(() => {
        if (!isClick) setIsDrag(false)
    }, [isClick]);
    useEffect(() => {
        if (!isDrag) setIsClick(false)
    }, [isDrag]);

    const getGhostSrc = async () => {
        if (!dropTarget) return null
        const canvas = await html2canvas(dropTarget, {scale: 1})
        return canvas.toDataURL()
    }
    const setGhostPosFunc = (e: MouseEvent<HTMLElement>) => {
        setGhostStyle({
            top: e.clientY + 5,
            left: e.clientX + 5,
        })
    }
    // WindowEnter
    const handleWindowEnter = (e: MouseEvent<HTMLElement>) => {
        if (isDrag && e.buttons === 0) { // 좌측 클릭 상태
            setIsDrag(false)
            return
        }
        setGhostPosFunc(e)
    }
    // DragEnd
    const handleDragEnd = (e: MouseEvent<HTMLElement>) => {
        setIsDrag(false)
        if (onDragEnd) onDragEnd(e)
        if (onDragOut) onDragOut(e)
    }

    const handleDragStartEvent = {
        onMouseDown: (e: MouseEvent<HTMLElement>) => { // 드래그 상태 확인
            if (e.button !== 0) return // 좌 클릭이 아니라면
            e.preventDefault()
            setIsClick(true)
        },
        onMouseUp: (e: MouseEvent<HTMLElement>) => { // 드래그 취소
            setIsClick(false)
            handleDragEnd(e)
        },
        onMouseLeave: (e: MouseEvent<HTMLElement>) => { // 드래그 시작
            if(!isClick) return // 클릭 상태가 아니라면
            getGhostSrc().then(src => setGhostSrc(src))
            setIsDrag(true)
            if (onDragStart) onDragStart(e)
        }
    }

    const handleWindowEvent = { // 윈도우 창 전체 영역 마우스 이벤트
        onMouseEnter: handleWindowEnter, // 윈도우창 바깥에서 들어오기
        onMouseUp: handleDragEnd, // 드래그 끝
        onMouseMove: (e:MouseEvent<HTMLElement>) => { // 드롭 제외 영역 호버
            e.preventDefault()
            setGhostPosFunc(e)
            if (onDragOut) onDragOut(e)
        }
    }
    
    const handleDropEvent = { // 드롭 영역 이벤트
        onMouseEnter: handleWindowEnter,
        onMouseUp: (e: MouseEvent<HTMLElement>) => { // 드롭 완료
            onDrop(e)
            handleDragEnd(e)
        },
        onMouseMove: (e: MouseEvent<HTMLElement>) => { // 드래그 중
            e.preventDefault()
            setGhostPosFunc(e)
            if (onDragOver) onDragOver(e)
        }
    }

    // GhostImage 컴포
    const GhostImage = (props?: ComponentProps<'img'>): ReactElement => {
        const transparentImg = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="

        return (<GhostImageStyle src={ghostSrc ?? transparentImg} alt={'ghost-image'} style={ghostStyle} {...props} />)
    }

    return {isDrag, GhostImage, handleWindowEvent, handleDropEvent, handleDragStartEvent}
}

export default useDrop;