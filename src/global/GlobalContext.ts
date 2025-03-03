import {createContext} from "react";

interface GlobalContextType {
    tooltip: {
        [key: string]: string
    },
}

const GlobalContext = createContext<GlobalContextType>({
    tooltip: {},
})

export default GlobalContext