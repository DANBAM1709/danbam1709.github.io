import createReducerContext from "../common/createReducerContext.tsx";

interface State {
    deleteEl: HTMLElement|null
    isTooltip: boolean
}

type Action = |
    {type: 'DELETE_CARD', payload: HTMLElement}|
    {type: 'TOGGLE_TOOLTIP', payload: boolean}

const initialState: State = {
    deleteEl: null,
    isTooltip: false
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'DELETE_CARD':
            return {...state, deleteEl: action.payload}
        case 'TOGGLE_TOOLTIP':
            return {...state, isTooltip: action.payload}
        default:
            return state
    }
}

const {Provider: RichEditorProvider, useGenericContext: useRichEditContext} = createReducerContext<State, Action>(reducer, initialState)
// const useEditContext = useRichEditContext(reducer, initialState)

export {RichEditorProvider, useRichEditContext}