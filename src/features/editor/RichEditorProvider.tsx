import {ReactNode} from "react";
import ContentStoreProvider from "./provider/ContentStoreProvider.tsx";
import ContentHistoryProvider from "./provider/ContentHistoryProvider.tsx";

const RichEditorProvider = ({children}: {children: ReactNode}) => {
    return (<ContentStoreProvider><ContentHistoryProvider>
        {children}
    </ContentHistoryProvider></ContentStoreProvider>)
}

export default RichEditorProvider