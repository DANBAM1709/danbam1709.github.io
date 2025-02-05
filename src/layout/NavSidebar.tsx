import styled from "styled-components";

const Container = styled.div`
    height: 100vh;
    max-height: 100vh;
    width: var(--sidebar-width);
    
    & > div {
        position: fixed;
        height: 100vh;
        max-height: 100vh;
        width: var(--sidebar-width);
        box-shadow: rgba(0, 0, 0, 0.024) -1px 0 0 0 inset;
        background: rgb(248, 248, 247);
        z-index: 10;
    }
`

interface MenuBtnProps {
    $depth?: number
}

const MenuBtn = styled.div<MenuBtnProps>`
    display: flex;
    align-items: center;
    min-height: 28px;
    line-height: 1.2;
    user-select: none;
    font-size: 14px;
    padding-left: ${({$depth}: MenuBtnProps) => $depth ? `${10 + 8*$depth}px` : '10px'};
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

const NavSidebar = () => {
    return (<Container><div style={{position: 'fixed'}}>
        <MenuBtn>
            <img src={'search.svg'} alt={'search.svg'} width={'20px'} height={'20px'} />
            <span>검색</span>
        </MenuBtn>
        <MenuBtn $depth={1}>
            <img src={'search.svg'} alt={'search.svg'} width={'20px'} height={'20px'} />
            <span>검색</span>
        </MenuBtn>
    </div></Container>)
}

export default NavSidebar