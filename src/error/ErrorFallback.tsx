import {FallbackProps} from "react-error-boundary";
import {useNavigate} from "react-router-dom";
import errorStyle from "./errorStyle.ts";

// 런타임 에러 처리용
const ErrorFallback = ({error}: Readonly<FallbackProps>) => {
    const navigate = useNavigate();

    return (
        <div style={errorStyle}>
            <div>{error.message}</div> <br />
            <button onClick={()=>navigate(-1)}>이전 페이지로 돌아가기</button>
        </div>
    );
}

export default ErrorFallback