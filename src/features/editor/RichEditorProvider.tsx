import {ReactNode} from "react";
import CardStoreProvider from "./provider/CardStoreProvider.tsx";
import CardHistoryProvider from "./provider/CardHistoryProvider.tsx";

const RichEditorProvider = ({children}: {children: ReactNode}) => {
    return (<CardStoreProvider><CardHistoryProvider>
        {children}
    </CardHistoryProvider></CardStoreProvider>)
}

export default RichEditorProvider