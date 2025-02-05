import {ComponentPropsWithoutRef, forwardRef, useContext} from "react";
import SoftBtn from "../ui/SoftBtn.tsx";
import SelectContext from "./SelectContext.ts";

const DropButton = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(({children, ...rest}, ref) => {
    const {setOpen} = useContext(SelectContext)

    const onClick = () => {
        setOpen(prev => !prev)
    }

    return (<SoftBtn ref={ref} onClick={onClick} {...rest}>
        {children}
        <img src={'chevron-down.svg'} alt={'chevron-down.svg'} width={'10px'} height={'100%'} style={{marginLeft: '4px'}} />
    </SoftBtn>)
})

export default DropButton