import styled from "styled-components";
import CustomTextArea, {CustomTextAreaElement} from "../../component/CustomTextArea.tsx";
import {forwardRef, useImperativeHandle, useRef} from "react";
import GhostContainer from "../../base-style/GhostContainer.tsx";
import useCardTypingHistory from "./hook/useCardTypingHistory.ts";

const TextArea = styled(CustomTextArea)``

interface CardTextAreaProps {
    content: {html: string}
}

const CardTextArea = forwardRef<CustomTextAreaElement, CardTextAreaProps>(({content}, ref) => {
    const targetRef = useRef<CustomTextAreaElement>(null)
    const handleTypingHistory = useCardTypingHistory(targetRef.current)

    useImperativeHandle(ref, () => {
        if (targetRef.current) {
            return Object.assign(targetRef.current)
        }
        throw new Error('CardTextArea ref error!')
    })

    return <GhostContainer {...handleTypingHistory}>
        <TextArea ref={targetRef} content={content} />
    </GhostContainer>
})

export default CardTextArea