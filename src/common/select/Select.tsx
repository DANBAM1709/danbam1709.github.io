import {ComponentPropsWithoutRef, useMemo, useState} from "react";
import SelectContext from "./SelectContext.tsx";

const Select = ({...rest}: ComponentPropsWithoutRef<'div'>) => {
    const [open, setOpen] = useState<boolean>(false)

    // 리랜더링될 때마다 새로운 객체로 생성되는 것 방지
    const value = useMemo(() => ({open, setOpen}), [open, setOpen])

    return (
        <SelectContext.Provider value={value} >
            <div {...rest} />
        </SelectContext.Provider>
    )
}

export default Select