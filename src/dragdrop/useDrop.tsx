import {ComponentProps, CSSProperties, MouseEvent, ReactElement, useEffect, useMemo, useRef, useState,} from "react";
import html2canvas from "html2canvas";
import {DropContextType} from "./DropContext.tsx";
import styled from "styled-components";
import {throttle} from "lodash";

const GhostImageStyle = styled.img`
    position: fixed;
    opacity: 0.1;
    object-fit: contain;
    z-index: 99999;
    pointer-events: none !important;
    user-select: none !important;
`

interface DragHandler {
    dropTarget: HTMLElement | null
    onDragStartBefore?: (e?: MouseEvent<HTMLElement>)=>void
    onDragStart?: (e?: MouseEvent<HTMLElement>)=>void
    onDragOver?: (e?: MouseEvent<HTMLElement>)=>void
    onDragOut?: (e?: MouseEvent<HTMLElement>)=>void
    onDragEnd?: (e?: MouseEvent<HTMLElement>)=>void
    onDrop?: (e?: MouseEvent<HTMLElement>)=>void
}

/**
 * dropTarget: 드롭 장소, onDragStart: 드롭 시작, onDragOver: 드롭 중, onDragOut: 드롭 영역 밖, onDrop: 드롭 완료 <br />
 * 파라미터 함수 정의시 (e?: MouseEvent<HTMLElement>)<br />
 * return isDrag:boolean, ...etc
 */
const useDrop = ({dropTarget, onDragStartBefore, onDragStart, onDragOver, onDragOut, onDragEnd, onDrop}: DragHandler): DropContextType => {
    const [startX, startY] = [useRef<number>(0), useRef<number>(0)]
    const  [isClick, setIsClick] = useState<boolean>(false)
    const [isDrag, setIsDrag] = useState<boolean>(false)
    const [ghostSrc, setGhostSrc] = useState<string|null>(null) // 고스트 이미지 캡쳐 src
    const [ghostStyle, setGhostStyle] = useState<CSSProperties>({})

    useEffect(() => {
        if (!isClick) {
            setIsDrag(false)
        }
    }, [isClick]);
    useEffect(() => {
        if (!isDrag) {
            startX.current = 0
            startY.current = 0
            setIsClick(false)
        }
    }, [isDrag, startX, startY]);

    const getGhostSrc = async () => {
        if (!dropTarget) return null
        const canvas = await html2canvas(dropTarget, {scale: 1})
        return canvas.toDataURL()
    }
    const setGhostPosFunc = useMemo(() => throttle((e: MouseEvent<HTMLElement>) => { // 경계에서 동시에 실행되는 Warning 문제 해결을 위한 throttle useMemo 안쓰면 빈도수가 줄 뿐 여전히 존재함
        setGhostStyle({
            top: e.clientY + 5, // SyntheticEvent 이벤트 종료 이후 재사용 pooling 될 때 내부 속성이 null 이 되지만 clientY 같은 원시값은 클로저에 캡쳐되어 안전하게 유지됨 
            left: e.clientX + 5,
        })
    }, 15), [])

    useEffect(() => { // unmount 시 재생성 방지
        return () => {
            setGhostPosFunc.cancel();
        };
    }, [setGhostPosFunc]);

    // DragStart
    const handleDragStart = (e: MouseEvent<HTMLElement>) => { // 드래그 시작
        getGhostSrc().then(src => setGhostSrc(src))
        setIsDrag(true)
        if (onDragStart) onDragStart(e)
    }
    // DragEnd
    const handleDragEnd = (e: MouseEvent<HTMLElement>) => {
        setIsDrag(false)
        if (onDragEnd) onDragEnd(e)
        if (onDragOut) onDragOut(e)
    }
    // WindowEnter
    const handleWindowEnter = (e: MouseEvent<HTMLElement>) => {
        // e.buttons === 1: 좌클릭
        if (isDrag && e.buttons !== 1) handleDragEnd(e)
    }

    const handleDragStartEvent = {
        onMouseDown: (e: MouseEvent<HTMLElement>) => { // 드래그 상태 확인
            e.preventDefault()
            if (e.button !== 0) return // 좌 클릭이 아니라면
            setIsClick(true)
            startX.current = e.clientX
            startY.current = e.clientY
            if (onDragStartBefore) onDragStartBefore(e) // 드래그 전
        },
        onMouseUp: (e: MouseEvent<HTMLElement>) => { // 드래그 취소
            setIsClick(false)
            handleDragEnd(e)
        },
        onMouseMove: (e: MouseEvent<HTMLElement>) => { // 드래그 영역이 클 때를 대비한 드래그 검증
            if (!isClick) return // 좌 클릭 상태가 아니라면
            const deltaX = Math.abs(e.clientX - startX.current)
            const deltaY = Math.abs(e.clientY - startY.current)
            if (deltaX + deltaY > 10) { // 드래그 상태로 감지
                handleDragStart(e)
            }
        },
        onMouseLeave: (e: MouseEvent<HTMLElement>) => { // 드래그 시작
            if(!isClick || isDrag) return // 클릭 상태가 아니라면 + 이미 드래그 시작된 상태라면
            handleDragStart(e)
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
            handleDragEnd(e)
            if (onDrop) onDrop(e)
        },
        onMouseMove: (e: MouseEvent<HTMLElement>) => { // 드래그 중
            e.preventDefault()
            if (e.buttons !== 1) return // 빠르게 클릭 후 이동하면 랜더링이 사라지기도 전에 다시 실행됨, 이를 방지하기 위함
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