import {createContext, Dispatch, SetStateAction} from "react";

interface EditorContextType {
    addIndex: number // 추가될 위치 인덱스
    isAddBlock: boolean // 추가 여부 확인
    setAddIndex: Dispatch<SetStateAction<number>>
    setIsAddBlock: Dispatch<SetStateAction<boolean>>
}

const EditorContext = createContext<EditorContextType>({
    addIndex: 0,
    isAddBlock: false,
    setAddIndex: () => {},
    setIsAddBlock: () => {},
})

export default EditorContext