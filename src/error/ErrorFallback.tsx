import {FallbackProps} from "react-error-boundary";
import errorStyle from "./errorStyle.ts";

// 런타임 에러 처리용
const ErrorFallback = ({error}: Readonly<FallbackProps>) => {

    return (
        <div style={errorStyle}>
            <div>{error.message}</div> <br />
            <button onClick={()=>window.location.reload()}>새로고침</button>
        </div>
    );
}

export default ErrorFallback