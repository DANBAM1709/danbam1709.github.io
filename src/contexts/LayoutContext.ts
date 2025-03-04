import createReducerContext from "./createReducerContext.tsx";
import {
    initRichEditorState,
    RichEditorAction,
    richEditorReducer,
    RichEditorState
} from "../features/editor/richEditor.reducer.ts";

// 리치 에디터 reducer Provider
const {Provider: createRichEditorProvider, useGenericContext: useGenericRichEditorContext} = createReducerContext<RichEditorState, RichEditorAction>(richEditorReducer, initRichEditorState)
export const RichEditorProvider = createRichEditorProvider
export const useRichEditorContext = useGenericRichEditorContext