import styled from "styled-components";

// $depth?: 폴더 깊이
const MenuBtn = styled.div<{ $depth?: number }>`
    display: flex;
    align-items: center;
    min-height: 28px;
    line-height: 1.2;
    user-select: none;
    font-size: 14px;
    padding-left: ${({$depth}) => $depth ? `${10 + 8*$depth}px` : '10px'};
    padding-right: 12px;
    margin-right: 4px;
    margin-left: 4px;
    cursor: pointer;
    border-radius: 6px;
    
    &:hover {
        background: rgba(55, 53, 47, 0.06);   
    }
    
    img {
        margin-right: 8px;
    }
`

export default MenuBtn