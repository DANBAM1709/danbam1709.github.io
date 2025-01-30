import {css} from "styled-components";

export interface  StyledComponent {
    $customStyles?: string
}

export const dynamicStyles = css<StyledComponent>`
    ${({$customStyles}) => $customStyles ?? ''}
`;