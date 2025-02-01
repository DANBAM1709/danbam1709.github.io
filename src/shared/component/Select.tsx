import styled from "styled-components";
import {
    ComponentPropsWithoutRef,
    createContext,
    Dispatch, forwardRef,
    MouseEvent,
    SetStateAction,
    useContext,
    useEffect,
    useMemo, useRef,
    useState
} from "react";
import SoftBtn from "./SoftBtn.tsx";

interface SelectContextType {
    open: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>
}

const SelectContext = createContext<SelectContextType>({ // Context 내 전역 변수 관리 (컴포넌트 별로 관리 가능)
    open: false,
    setOpen: () => {} // undefined 로 인한 오류 방지
})

const OptionsContainer = styled.div.attrs({ tabIndex: 0 })` // tabIndex: 0 -> focus ok    
    display: flex;
    flex-direction: column;
    position: absolute;
    background: white;
    top: 4px;
    opacity: 0;
    gap: 1px;
    padding: 4px 0;
    max-height: 70vh;
    box-shadow: rgba(15, 15, 15, 0.05) 0 0 0 1px, rgba(15, 15, 15, 0.1) 0 3px 6px, rgba(15, 15, 15, 0.2) 0 9px 24px;
    border-radius: 10px;
    
    & > div:not([class]) { // className 없는 div
        white-space: nowrap;
        padding: 0 14px;
        margin: 6px 0 4px;
        color: rgba(55, 53, 47, 0.65);
    }
    &:focus {
        outline: none;
    }
`

const OptionContainer = styled.div`
    user-select: none; // 드래그 불가
    cursor: pointer;
    transition: background 20ms ease-in;
    margin: 0 4px;
    border-radius: 6px;
    padding: 4px 12px 4px 10px;
    box-sizing: border-box;
    gap: 10px;
    white-space: nowrap;
    
    &:hover {
        background: rgba(55, 53, 47, 0.06);
    }
`

export const Select = ({...rest}: ComponentPropsWithoutRef<'div'>) => {
    const [open, setOpen] = useState<boolean>(false)

    // 리랜더링될 때마다 새로운 객체로 생성되는 것 방지
    const value = useMemo(() => ({open, setOpen}), [open, setOpen])

    return (
        <SelectContext.Provider value={value} >
            <div {...rest} />
        </SelectContext.Provider>
    )
}

export const DropButton = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(({children, ...rest}, ref) => {
    const {setOpen} = useContext(SelectContext)

    const onClick = () => {
        setOpen(prev => !prev)
    }

    const svgStyle = {
        width: '10px',
        height: '100%',
        display: 'block',
        fill: 'rgba(55, 53, 47, 0.35)',
        marginLeft: '4px'
    }
    return (<SoftBtn ref={ref} onClick={onClick} {...rest}>
        {children}
        <svg role="graphics-symbol" viewBox="0 0 30 30" style={svgStyle}>
            <polygon points="15,17.4 4.8,7 2,9.8 15,23 28,9.8 25.2,7 "></polygon>
        </svg>
    </SoftBtn>)
})

export const Options = ({...rest}: ComponentPropsWithoutRef<'div'>) => {
    const {open, setOpen} = useContext(SelectContext)
    const target = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!target.current) return
        if (open) {
            target.current.focus()
            target.current.style.opacity = '1'
            target.current.style.zIndex = '10'
        } else {
            target.current.style.opacity = '0'
            target.current.style.zIndex = '-10'
        }
    }, [open]);

    return (<div style={{position: 'relative'}}>
        <OptionsContainer ref={target} onBlur={()=>setOpen(false)} {...rest} />
    </div>)
}

export const Option = ({onClick, ...rest}: ComponentPropsWithoutRef<'div'>) => {
    const {setOpen} = useContext(SelectContext)

    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
        setOpen(false)
        if (onClick) onClick(e) // 상위 컴포넌트에서 정의한 onClick
    }
    
    return (<OptionContainer onClick={handleClick} {...rest} />)
}