import {ReactNode, useMemo, useState} from "react";
import SelectContext from "./SelectContext.ts";

interface Props {
    children: ReactNode
}

// <Select><DropButton /><Options><Option /></Options></Select>
const SelectProvider = ({children}: Props) => {
    const [open, setOpen] = useState<boolean>(false)
    const [buttonEl, setButtonEl] = useState<HTMLElement|null>(null)

    // 리랜더링될 때마다 새로운 객체로 생성되는 것 방지
    const value = useMemo(() => ({open, setOpen, buttonEl, setButtonEl}), [open, buttonEl])

    return (
        <SelectContext.Provider value={value}>{children}</SelectContext.Provider>
    )
}

// 개발 단계 확인
// type ExtendedComponentType = JSXElementConstructor<unknown> & {
//     WrappedComponent?: JSXElementConstructor<unknown>
// }
// SelectProvider.propTypes = {
//     children: function (props: Record<string, unknown>, propName: string, componentName: string) {
//         const childrenArray = Children.toArray(props[propName] as ReactNode[]);
//         const selectBtnCount = childrenArray.filter(
//             (child) => {
//                 if (isValidElement(child)) {
//                     console.log(child)
//                     if (typeof child.type === 'string') return false
//                     console.log((child.type as ComponentType<unknown>).displayName?.includes('SelectBtn'))
//                     return (child.type as ComponentType<unknown>).displayName?.includes('SelectBtn')
//                 }
//                     // return child.type.displayName === SelectBtn || (child.type as ExtendedComponentType).WrappedComponent === SelectBtn
//             }
//         ).length
//
//         console.log(selectBtnCount)
//
//
//         // if (selectBtnCount !== 1) {
//         //     return new Error(
//         //         `${componentName} 내부에는 반드시 단 하나의 SelectBtn이 있어야 합니다. 현재 ${selectBtnCount}개 있습니다.`
//         //     );
//         // }
//         return null;
//     },
// };

export default SelectProvider