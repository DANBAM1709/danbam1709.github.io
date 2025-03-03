import {CSSProperties} from "react";

const errorStyle: CSSProperties = {
    width: '100%',
    height: 'calc(100vh - var(--footer-height))',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    userSelect: 'text',
    pointerEvents: 'auto'
}

export default errorStyle