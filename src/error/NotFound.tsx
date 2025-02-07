import {useNavigate} from "react-router-dom";
import errorStyle from "./errorStyle.ts";

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div style={errorStyle}>
            <div>404 NOT FOUND</div> <br />
            <button onClick={()=>navigate(-1)}>이전 페이지로 돌아가기</button>
        </div>
    );
}

export default NotFound
