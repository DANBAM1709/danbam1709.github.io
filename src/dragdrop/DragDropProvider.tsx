import {ReactNode} from "react";
import DropContext, {DropContextType} from "./DropContext.tsx";

// useDrop: 커스텀 useDrop
const DragDropProvider = ({children, useDrop}: {children: ReactNode, useDrop: DropContextType}) => {

    return(<DropContext.Provider value={useDrop} >{children}</DropContext.Provider>)
}

export default DragDropProvider