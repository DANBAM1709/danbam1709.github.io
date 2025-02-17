import {createContext, Dispatch, ReactNode, Reducer, useContext, useMemo, useReducer} from "react";

interface ContextType<S, A> {
    state: S,
    dispatch: Dispatch<A>
}

// 제너릭을 사용한 리듀서 주입 Context App.tsx 에서 사용 예정 <br />
// createReducerContext<S:State, A:Action>(reducer, initialState) <br />
// return {Provider, useGenericContext}
function createReducerContext<S, A>(reducer: Reducer<S, A>, initialState: S) {
    const Context = createContext<ContextType<S, A>|undefined>(undefined)

    const Provider = ({children}: {children: ReactNode}) => {
        const [state, dispatch] = useReducer(reducer, initialState)
        const value = useMemo(() => ({state, dispatch}), [state])

        return (<Context.Provider value={value}>{children}</Context.Provider>)
    }

    const useGenericContext = () => {
        const context = useContext(Context)

        if(!context) throw new Error('useGenericContext must be used within its Provider');

        return context
    }

    return {Provider, useGenericContext}
}

export default createReducerContext