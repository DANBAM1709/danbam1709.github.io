import {ComponentPropsWithoutRef, MouseEvent, ReactNode} from "react";
import styled from "styled-components";
import Button from "../base/Button.tsx";
import {useSelectContext} from "./SelectContext.ts";

const Container = styled(Button)``

interface Props extends ComponentPropsWithoutRef<"div"> {
    children: ReactNode
}
const SelectBtn = ({children, onClick, ...props}: Props) => {
    const {setOpen, setButtonEl} = useSelectContext() // Options open

    // // 외부 ref와 내부 상태(ref)를 모두 처리하기 위한 콜백
    // const containerRef = useCallback(
    //     (node: HTMLDivElement | null) => {
    //         setButtonEl(node);
    //
    //         if (!ref) return;
    //         if (typeof ref === 'function') {
    //             ref(node);
    //         } else {
    //             (ref as MutableRefObject<HTMLElement | null>).current = node;
    //         }
    //     },
    //     [ref, setButtonEl]
    // );
    

    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
        setOpen(prev => {
            if (prev) e.currentTarget.focus() // Options 이벤트에서 버튼으로 포커싱 이동 open -> False
            return !prev
        })
        if(onClick) onClick(e)
    }


    return (<Container ref={setButtonEl} onClick={handleClick} {...props}>{children}</Container>)
}

// 개발 단계에서만 실행
// if (process.env.NODE_ENV !== 'production') {
//     SelectBtn.displayName = 'SelectBtn';
// }

export default SelectBtn