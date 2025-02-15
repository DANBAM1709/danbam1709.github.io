import {ReactElement, useMemo, useState} from "react";
import EditorContext from "./EditorContext.ts";

const EditorProvider = ({children} : {children: ReactElement}) => {
    const [addIndex, setAddIndex] = useState<number>(0)
    const [isAddBlock, setIsAddBlock] = useState<boolean>(false)

    const value = useMemo(() => ({
            addIndex: addIndex,
            setAddIndex: setAddIndex,
            isAddBlock: isAddBlock,
            setIsAddBlock: setIsAddBlock,
    }), [addIndex, isAddBlock, setAddIndex, setIsAddBlock])

    return (<EditorContext.Provider value={value}>{children}</EditorContext.Provider>)
}

export default EditorProvider