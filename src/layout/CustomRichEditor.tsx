import styled from "styled-components";
import {KeyboardEvent, MouseEvent, useEffect, useMemo, useRef, useState} from "react";
import CommonTextArea from "../editor/CommonTextArea.tsx";
import EditorProvider from "../editor/EditorProvider.tsx";
import {useSelection, useTooltip} from "../global/hook.ts";
import SoftBtn from "../common/ui/SoftBtn.tsx";
import TooltipWrapper from "../common/ui/TooltipWrapper.tsx";
import TextToolbar from "../editor/TextToolbar.tsx";
import {eventManager} from "../global/event.ts";
import {cloneDeep} from 'lodash';
import Select from "../common/select/Select.tsx";
import DropButton from "../common/select/DropButton.tsx";
import Options from "../common/select/Options.tsx";
import Option from "../common/select/Option.tsx";
import SelectStyled from "../editor/SelectStyled.tsx";

const Container = styled.div`
    position: relative;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    
    .top {
        display: flex;
        justify-content: center;
        padding-top: calc(var(--header-height) + 80px);
        padding-bottom: 8px;
    }
    .title {
        font-size: 32px;
    }
    .title, .content {
        width: var(--content-width);
        max-width: var(--content-width);
        height: fit-content;
    }
    
    .content-wrapper {
        display: flex;
    }
    .content-wrapper:last-of-type {
        flex: 1;
    }
    .content-wrapper:hover .action-tool {
        opacity: 1;
    }
    .action-tool {
        display: flex;
        opacity: 0;
        width: calc((100% - var(--content-width)) / 2);
    }
    .action-tool.left {
        justify-content: flex-end;
    }
    .action-tool-group {
        display: flex;
        align-items: center;
        height: calc(1em * var(--line-height));
    }
    .left .action-tool-group {
        padding-right: 5px;
    }
    
    .plus-btn {
        width: 24px;
        height: 24px;
        padding: 0;
        margin-right: 2px;
    }
`

const CustomRichEditorContainer = () => {
    const tooltip = useTooltip()
    const selection = useSelection()

    const prevRef = useRef<HTMLDivElement[]>([]) // 새로운 Content 추가시 focus 용도

    const titleRef = useRef<HTMLDivElement>(null) // 제목
    const [contents, setContents] = useState<{id: string, html: string, type: string}[]>([]) // 텍스트 블록
    const contentsRef = useRef<HTMLDivElement[]>([]) // 현존 컴포넌트

    const [isToolActive, setIsToolActive] = useState<boolean>(false) // true: 텍스트 스타일 툴바
    const [saveTrigger, setSaveTrigger] = useState<boolean>(false) // true: 저장

    useEffect(() => { // init
        const save = (e: KeyboardEvent) => {
            if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
                e.preventDefault()
                setSaveTrigger(true)
            }
        }

        eventManager.addEventListener('keydown', 'CustomRichEditor', save as unknown as EventListener)
        return () => eventManager.removeEventListener('keydown', 'CustomRichEditor')
    }, []);

    useEffect(() => {
        if(contents.length === 0) { // contents 가 전부 지워질 경우
            setContents([{id: `${crypto.randomUUID()}`, html: '', type: 'default'}])
        }

        const prev = prevRef.current
        const current = contentsRef.current

        const newRef = current.filter(obj1 => !prev.some(obj2 => obj2.id === obj1.id)).slice(-1)[0]
        prevRef.current = cloneDeep(contentsRef.current)

        const firstRender = (current.length === 1) && (current[0].innerHTML === '') && (titleRef.current?.innerHTML === '')
        if (firstRender) { // 제목 포커싱
            titleRef.current?.focus()
            return
        }

        if (newRef) newRef.focus()
    }, [contents]);

    useEffect(() => { // 저장
        if (!saveTrigger) return
        const saveContents = contentsRef.current.map((el, index) => ({id: el.id, html: el.innerHTML, type: contents[index].type}));
        setContents(saveContents)
        setSaveTrigger(false)
    }, [contents, saveTrigger]);

    const handleBlock = {
        onClick: (e: MouseEvent<HTMLDivElement>) => {
            const editableEl = e.currentTarget.querySelector('[contenteditable]')
            if (editableEl) (editableEl as HTMLElement).focus()
        }
    }

    const handleContent = {
        onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
            const con = { // 조건 모음
                empty: !e.currentTarget.firstChild, // 내용이 없다면
                delete: e.key === 'Backspace'  && e.currentTarget.innerHTML === '<br>', // 블록 삭제
                up: e.key === 'ArrowUp', // 블록 이동 위로
                down: e.key === 'ArrowDown', // 블록 이동 아래로
            }

            // 첫 줄 텍스트 노드 방지 안되고 있는 듯?
            if (con.empty) {
                // console.log(e.currentTarget.firstChild)
                // const range = selection!.getRangeAt(0)
                // const div = document.createElement('div')
                // div.textContent = '\u200B'
                // e.currentTarget.appendChild(div)
                // range.selectNodeContents(div.firstChild!)
                // range.collapse(false) // 마지막 위치로 이동
            }

            // <- backspace && empty
            if (con.delete) {
                console.log('삭제')
                // e.currentTarget.innerHTML = '<div></div>' // 텍스트 블록 삭제
            }

            // 방향키 Up
            if (con.up) {
                if (!selection) { // empty
                    console.log('위로')
                    return
                }
                const range = selection.getRangeAt(0)

                const rangeTop = range.getBoundingClientRect().top
                const top = e.currentTarget.getBoundingClientRect().top

                const prev = range.startContainer.previousSibling

                const empty = !prev || (e.currentTarget === range.startContainer)
                const condition1 = rangeTop === 0 && empty;
                const condition2 = rangeTop !== 0 && (rangeTop - top) < 5 // 커서와 끝의 오차 임의값 5

                if (condition1 || condition2) {
                    console.log('위로')
                }
            }

            // 방향키 Down
            if (con.down) {
                if (!selection) { // empty
                    console.log('아래로')
                    return
                }
                const range = selection.getRangeAt(0)

                const rangeBottom = range.getBoundingClientRect().bottom
                const bottom = e.currentTarget.getBoundingClientRect().bottom

                const condition1 = rangeBottom === 0 && !range.endContainer.nextSibling // 마지막 줄이면서 내용물 없을 때 Br 태그를 가리키며 rangeBottom=0 이 되므로
                const condition2 = (bottom - rangeBottom) < 5 // 커서와 끝의 오차 임의값 5

                if (condition1 || condition2) {
                    console.log('아래로')
                }
            }

        },
        onFocus: () => setIsToolActive(true),
        onBlur: () => setIsToolActive(false),
    }

    const handleAddContent  = (index: number, type: string) => ({
        onClick: (e: MouseEvent<HTMLDivElement>) => {
            e.stopPropagation()
            const newContent = {id: `${crypto.randomUUID()}`, html: '', type: type}
            let addIndex = index+1
            if (e.ctrlKey || e.metaKey) { // 이전 추가 윈도우 ctrl, 맥 meta 이전에 삽입된 경우
                addIndex = index
            }
            // 다음 추가? 흠... 추가를 한 다음에 그 블럭 뜨게 할까? 고민이네
            setContents(pre => [...pre.slice(0, addIndex), newContent, ...pre.slice(addIndex)])
        }
    })

    return (<Container>
        <div className={'top'} {...handleBlock}><CommonTextArea ref={titleRef} className={'title'} data-placeholder={'제목'} /></div>
        {contents.map((content, index) => (
            <div className={'content-wrapper'} key={content.id}{...handleBlock}>
                <div className={'action-tool left'}>
                    <div className={'action-tool-group'}>
                            <Select>
                                <DropButton><TooltipWrapper summary={tooltip.plusContent}><SoftBtn className={'plus-btn'}>
                                        <img src={`plus.svg`} alt={'plus.svg'} width={'16px'} height={'16px'} />
                                </SoftBtn></TooltipWrapper></DropButton>
                                <Options>
                                    <Option {...handleAddContent(index, 'default')}>기본</Option>
                                    <Option {...handleAddContent(index, 'code')}>코드스타일</Option>
                                </Options>
                            </Select>
                    </div>
                </div>
                <SelectStyled id={content.id} type={content.type} className={'content'} ref={el => {if (el) contentsRef.current[index] = el}} {...handleContent}>{content.html}</SelectStyled>
                {/*<CommonTextArea id={content.id}  ref={el => {if (el) contentsRef.current[index] = el}} className={'content'} {...handleContent}>{content.html}</CommonTextArea>*/}
            </div>
        ))}
        {isToolActive? <TextToolbar />:null}
    </Container>)
}

const CustomRichEditor = () => (<EditorProvider><CustomRichEditorContainer /></EditorProvider>)

export default CustomRichEditor