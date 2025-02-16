import {
    ComponentPropsWithoutRef,
    forwardRef,
    MouseEvent,
    MutableRefObject,
    ReactNode,
    useCallback,
    useContext
} from "react";
import SelectContext from "./SelectContext.ts";
import styled from "styled-components";
import Button from "../base/Button.tsx";

const Container = styled(Button)``

interface Props extends ComponentPropsWithoutRef<"div"> {
    children: ReactNode
}
const SelectBtn = forwardRef<HTMLDivElement, Props>(({children, onClick, ...props}, ref) => {
    const {setOpen, setButtonEl} = useContext(SelectContext) // Options open

    // 외부 ref와 내부 상태(ref)를 모두 처리하기 위한 콜백
    const containerRef = useCallback(
        (node: HTMLDivElement | null) => {
            setButtonEl(node);

            if (!ref) return;
            if (typeof ref === 'function') {
                ref(node);
            } else {
                (ref as MutableRefObject<HTMLElement | null>).current = node;
            }
        },
        [ref, setButtonEl]
    );
    

    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
        setOpen(prev => {
            if (prev) e.currentTarget.focus() // Options 이벤트에서 버튼으로 포커싱 이동 open -> False
            return !prev
        })
        if(onClick) onClick(e)
    }


    return (<Container ref={containerRef} onClick={handleClick} {...props}>{children}</Container>)
})

export default SelectBtn