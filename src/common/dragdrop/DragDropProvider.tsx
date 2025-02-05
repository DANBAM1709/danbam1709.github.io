import {ReactNode} from "react";
import DropContext, {DropContextType} from "./DropContext.tsx";

const DropProvider = ({children, useDrop}: {children: ReactNode, useDrop: DropContextType}) => {

    return(<DropContext.Provider value={useDrop} >{children}</DropContext.Provider>)
}

export default DropProvider