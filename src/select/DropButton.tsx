import {ComponentPropsWithoutRef, forwardRef, MouseEvent, useContext} from "react";
import SelectContext from "./SelectContext.ts";

const DropButton = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(({children, onClick, ...props}, ref) => {
    const {setOpen} = useContext(SelectContext) // Options open

    const handler = {
        onClick: (e: MouseEvent<HTMLDivElement>) => {
            setOpen(prev => !prev)
            if(onClick) onClick(e)
        }
    }


    return (<div ref={ref} {...handler} {...props}>{children}</div>)
})

export default DropButton