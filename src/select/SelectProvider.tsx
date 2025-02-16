import {ComponentPropsWithoutRef, useMemo, useState} from "react";
import SelectContext from "./SelectContext.ts";
import styled from "styled-components";

const Container = styled.div.attrs({tabIndex: 0})`
    user-select: none;
`

// <Select><DropButton /><Options><Option /></Options></Select>
const SelectProvider = (props: ComponentPropsWithoutRef<'div'>) => {
    const [open, setOpen] = useState<boolean>(false)
    const [buttonEl, setButtonEl] = useState<HTMLElement|null>(null)

    // 리랜더링될 때마다 새로운 객체로 생성되는 것 방지
    const value = useMemo(() => ({open, setOpen, buttonEl, setButtonEl}), [open, buttonEl])

    return (
        <SelectContext.Provider value={value}><Container {...props} /></SelectContext.Provider>
    )
}

export default SelectProvider