import {cloneElement, ComponentPropsWithoutRef, forwardRef, isValidElement, MouseEvent, useContext} from "react";
import FlatSoftBtn from "../common/common/FlatSoftBtn.tsx";
import SelectContext from "./SelectContext.ts";

const DropButton = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(({children, onClick, ...props}, ref) => {
    const {setOpen} = useContext(SelectContext) // Options open

    const handler = {
        onClick: (e: MouseEvent<HTMLDivElement>) => {
            setOpen(prev => !prev)
            if(onClick) onClick(e)
        }
    }


    return (<>
        {isValidElement(children)? cloneElement(children, {...handler}):
            <FlatSoftBtn ref={ref} {...props} {...handler}>
                {children}
                <img src={'chevron-down.svg'} alt={'chevron-down.svg'} width={'10px'} height={'100%'} style={{marginLeft: '4px'}} />
            </FlatSoftBtn>
        }
    </>)
})

export default DropButton