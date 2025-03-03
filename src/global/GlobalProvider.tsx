import {ReactElement, useMemo} from "react";
import GlobalContext from "./GlobalContext.ts";
import tooltip from '../assets/resources/tooltip.json'


const GlobalProvider = ({children} : {children: ReactElement}) => {

    const value = useMemo(() => ({
        tooltip: tooltip
    }), [])

    return (<GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>)
}

export default GlobalProvider