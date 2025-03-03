import {useContext} from "react";
import GlobalContext from "./GlobalContext.ts";

export const useTooltip = () => useContext(GlobalContext).tooltip
// export const