import styled from "styled-components";

const Container = styled.div`
    user-select: none;
    position: fixed;
    height: var(--header-height);
    width: calc(100% - var(--sidebar-width));
    display: flex;
    overflow-x: hidden;
    
    .navigation-sidebar-button { // 좌
        width: 48px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .navigation-wrapper {
        display: flex;
        align-items: center;
        margin-right: 18px;
        font-size: 14px;
        flex: 1;
    }
    
    .properties-sidebar-button { // 우
        display: flex;
        align-items: center;
        margin-right: 10px;
        
        .last-edit-time {
            height: 28px;
            display: flex;
            align-items: center;
            white-space: nowrap;
            color: rgba(55, 53, 47, 0.5);
            margin: 0 8px;
        }
    }
`

const Header = () => {
    return (<Container>
        {/* 네비게이션 사이드바 버튼 */}
        <div className={'navigation-sidebar-button'}>
            {/*<TooltipWrapper summary={'좌측 네비임돠'}>*/}
            {/*    <FlatSoftBtn>*/}
            {/*        <img src={'menu.svg'} alt={'menu.svg'} width={'16px'} height={'16px'} />*/}
            {/*    </FlatSoftBtn>*/}
            {/*</TooltipWrapper>*/}
        </div>
        {/* 페이지 네비 링크 */}
        <div className={'navigation-wrapper'}>
            {/*<FlatSoftBtn>새 페이지</FlatSoftBtn>*/}
            {/*<span style={{color: 'rgba(55, 53, 47, 0.5)', margin: '0 2px'}}>/</span>*/}
            {/*<FlatSoftBtn>새 페이지</FlatSoftBtn>*/}
        </div>
        {/* 편집시간 + 메뉴 버튼 */}
        <div className={'properties-sidebar-button'}>
            <span className={'last-edit-time'}>지금 편집</span>
            {/*<TooltipWrapper summary={'스타일'}>*/}
            {/*    <FlatSoftBtn>*/}
            {/*        <img src={'ellipsis.svg'} alt={'ellipsis.svg'} width={'18px'} height={'18px'} />*/}
            {/*    </FlatSoftBtn>*/}
            {/*</TooltipWrapper>*/}
        </div>
    </Container>)
}

export default Header