import styled from "styled-components";
import ItemButton from "../shared/components/ItemButton.tsx";
import {Select, Options, Option, DropButton} from "../shared/components/Select.tsx";
import PlusButton from "../shared/components/PlusButton.tsx";

const Container = styled.div`
    min-height: 100vh;
    background: #747bff;
    padding: 0 15rem; // 가변적으로 설정해야 하나...
    
    .content {
        min-height: 100vh;
        background: #f9f9f9;
    }    
`

const CustomRichEditor = () => {
    return (
        <Container>
            <div className={'content'}>
                <PlusButton />
                <ItemButton onClick={() => console.log('히히')} icon={<img src={''} alt={''} />} />
                <Select>
                    <DropButton>히</DropButton>
                    <Options>
                        <div>설명이용</div>
                        <Option>안녕하세요 반가워요 잘있어요 다시 만나요</Option>
                        <Option>히잉</Option>
                    </Options>
                </Select>
            </div>
        </Container>
    )
}

export default CustomRichEditor