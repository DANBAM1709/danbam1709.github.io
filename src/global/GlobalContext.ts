import {createContext} from "react";

interface GlobalContextType {
    selection: Selection|null
}

const GlobalContext = createContext<GlobalContextType>({
    selection: null
})

export default GlobalContext