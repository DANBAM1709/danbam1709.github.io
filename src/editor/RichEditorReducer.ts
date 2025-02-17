import createReducerContext from "../common/createReducerContext.tsx";

interface State {
    deleteEl: HTMLElement|null // 삭제할 element 객체
    isTooltip: boolean // 텍스트 툴팁 show 여부
    dragIndex: number // 드래그 드랍 이동할 컴포넌트 target
    dropIndex: number // 드래그 드랍 이동될 인덱스
}

const initialState: State = {
    deleteEl: null,
    isTooltip: false,
    dragIndex: -1,
    dropIndex: -1,
}

type Action = |
    {type: 'DELETE_CARD', payload: HTMLElement}|
    {type: 'TOGGLE_TOOLTIP', payload: boolean}|
    {type: 'DROP_INDEX_UPDATE', payload: number}|
    {type: 'DRAG_INDEX_UPDATE', payload: number}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'DELETE_CARD':
            return {...state, deleteEl: action.payload}
        case 'TOGGLE_TOOLTIP':
            return {...state, isTooltip: action.payload}
        case 'DRAG_INDEX_UPDATE':
            return {...state, dragIndex: action.payload}
        case 'DROP_INDEX_UPDATE':
            return {...state, dropIndex: action.payload}
        default:
            return state
    }
}

const {Provider: RichEditorProvider, useGenericContext: useRichEditContext} = createReducerContext<State, Action>(reducer, initialState)

export {RichEditorProvider, useRichEditContext}