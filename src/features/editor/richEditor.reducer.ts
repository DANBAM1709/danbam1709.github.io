
export interface RichEditorState {
    deleteEl: HTMLElement|null // 삭제할 element 객체
    isTooltip: boolean // 텍스트 툴팁 show 여부
}

export const initRichEditorState: RichEditorState = {
    deleteEl: null,
    isTooltip: false,
}

export type RichEditorAction = |
    {type: 'DELETE_CARD', payload: HTMLElement}|
    {type: 'TOGGLE_TOOLTIP', payload: boolean}|
    {type: 'DROP_INDEX_UPDATE', payload: number}|
    {type: 'DRAG_INDEX_UPDATE', payload: number}

export function richEditorReducer(state: RichEditorState, action: RichEditorAction): RichEditorState {
    switch (action.type) {
        case 'DELETE_CARD':
            return {...state, deleteEl: action.payload}
        case 'TOGGLE_TOOLTIP':
            return {...state, isTooltip: action.payload}
        default:
            return state
    }
}