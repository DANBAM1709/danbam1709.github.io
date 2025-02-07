import {ReactElement, useEffect, useMemo, useState} from "react";
import GlobalContext from "./GlobalContext.ts";


const GlobalProvider = ({children} : {children: ReactElement}) => {
    const [selection, setSelection] = useState<Selection|null>(null)

    useEffect(() => {
        setSelection(window.getSelection())
    }, []);

    const value = useMemo(() => ({selection: selection}), [selection])

    return (<GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>)
}

export default GlobalProvider