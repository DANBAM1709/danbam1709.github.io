import {createContext, Dispatch, SetStateAction} from "react";

interface SelectContextType {
    open: boolean, //Options hide|show
    setOpen: Dispatch<SetStateAction<boolean>>
    buttonEl: HTMLElement|null
    setButtonEl: Dispatch<SetStateAction<HTMLElement|null>>
}

const SelectContext = createContext<SelectContextType>({ // Context 내 전역 변수 관리 (컴포넌트 별로 관리 가능)
    open: false,
    setOpen: () => {}, // undefined 로 인한 오류 방지
    buttonEl: null,
    setButtonEl: () => {}
})

export default SelectContext