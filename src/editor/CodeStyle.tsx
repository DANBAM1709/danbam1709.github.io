import styled from "styled-components";
import * as monaco from "monaco-editor";
import Editor, {loader} from '@monaco-editor/react';
import {useEffect, useRef, useState} from "react";

const Container = styled.div`    
    /* 테스트용 css */
    width: 500px;
    background: #f9f9f9;
    border: 1px solid #ccc;
    //margin: 1rem;
    padding: 1rem 0.5rem;
    border-radius: 0.3rem;
    box-sizing: border-box;
    
    .code-header {
        margin-bottom: 1.5rem;
        display: flex;
        position: relative;
    }

    .decorationsOverviewRuler { // 우측 스크롤바
        display: none !important;
    }    
    .monaco-editor .margin { // 라인 번호
        .line-numbers { // default
            font-size: 18px !important;
            color: darkgray !important;
        }
        .active-line-number { // 선택된 라인
            color: gray !important;
        }
    }
`
const Button = styled.button`
    padding: 0;
    margin: 0;
    border: none;
    
    &:focus {
        outline: none;
    }
`
const Select = styled.ul.attrs({ tabIndex: 0 })` // tabIndex: 0 -> focus ok
    list-style: none;
    position: absolute;
    top: 1.5rem;
    padding: 0;
    margin: 0;
`
const Option = styled.li`
    cursor: pointer;
    background: gainsboro;
    width: 100%;
    &:hover {
        background: #f9f9f9;
    }
`

/* ------------------------ Component ------------------------ */
const CodeStyle = ({children}: {children: string}) => {
    const selection = useRef<HTMLUListElement>(null)
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor|null>(null)
    const options = ['html', 'css', 'javascript', 'python']
    const [sortedOptions, setSortedOptions] = useState<string[]>([...options.filter(o=> o !== options[0])])
    const [isCopied, setIsCopied] = useState<boolean>(false) // 복사 여부 확인
    const [isOpen, setIsOpen] = useState<boolean>(false) // select 컨테이너 활성 여부
    const [selectOption, setSelectOption] = useState<string>(options[0])
    const [editorHeight, setEditorHeight] = useState<number>(0)

    useEffect(() => {
        if (isOpen) { // select 컨테이너 활성
            selection.current!.style.opacity = '1'
            selection.current!.style.zIndex = '99'
            selection.current!.focus()
        } else {
            selection.current!.style.opacity = '0'
            selection.current!.style.zIndex = '-99'
        }
    }, [isOpen])

    // 사용자 정의 코드 블럭 테마
    loader.init().then(monaco => {
        monaco.editor.defineTheme('transparentTheme', {
            base: "vs",
            inherit: true, // 현재 정의하는 테마가 기존 테마의 스타일을 상속받도록 함
            rules: [],
            colors: {
                'editor.background': "#00000000",
                'editor.border': "#00000000"
            }
        })
    })

    // Select 토글
    const handleToggleSelection = () => {
        setIsOpen(!isOpen)
    }

    // Option 선택
    const handleSelectOption = (option: string) => {
        setSelectOption(option)
        setSortedOptions([...options.filter(o => o !== option)])
        setIsOpen(false)
    }

    const copy = () => {
        navigator.clipboard.writeText(editorRef.current!.getValue())
        setIsCopied(true)
    }

    // 코드 에디터 기본 설정
    const editorOptions:monaco.editor.IStandaloneEditorConstructionOptions = {
        fontSize: 20,
        readOnly: false, // 읽기 전용 설정
        lineNumbersMinChars: 0, // 라인 번호 영역 최소 너비
        lineDecorationsWidth: 10, // 라인 번호와 코드 사이 간격 조정
        scrollBeyondLastLine: false, // 마지막 줄 넘어서 스크롤 방지
        renderLineHighlight: 'none', // 선택 라인 비활성화
        overviewRulerBorder: false, // 우측 미니맵 테두리 제거
        minimap: {
            enabled: false, // 미니맵 비활성화
        },
        // automaticLayout: true, // 자동 레이아웃 설정
    }

    // 높이 업데이트
    const onMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
        editorRef.current = editor

        editor.onDidContentSizeChange(() => {
            const contentHeight = editor.getContentHeight(); // 내용 높이 계산
            const layoutInfo = editor.getLayoutInfo(); // 현재 레이아웃 정보 가져오기

            editor.layout({ // 빼면 부자연스러운 깜빡임이 생김
                height: contentHeight, // 높이 설정
                width: layoutInfo.width, // 현재 너비 유지
            });

            setEditorHeight(contentHeight); // 빼면 에러 없어도 작동은 됨
        });

        const initialHeight = editor.getContentHeight();
        setEditorHeight(initialHeight);
    }

    return (<Container>
        <div className={'code-header'}>
            <Button onClick={handleToggleSelection}>{selectOption}</Button>
            <Select ref={selection} onBlur={() => setIsOpen(false)}>
                {sortedOptions.map(option => <Option onClick={()=>handleSelectOption(option)} key={option}>{option}</Option>)}
            </Select>
            <div style={{flex: '1'}}></div>
            <Button onClick={copy}>{isCopied? '복사 완료': '복사'}</Button>
        </div>
        <Editor
            language={selectOption}
            height={editorHeight}
            defaultValue={children} // 초기 코드 설정
            theme={"transparentTheme"}
            onMount={onMount}
            options = {editorOptions}
        />
    </Container>)

}

export default CodeStyle