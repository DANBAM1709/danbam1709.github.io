import styled from "styled-components";
import MenuBtn from "../uncategorized/test/MenuBtn.tsx";

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