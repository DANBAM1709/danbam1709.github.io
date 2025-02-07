import {useContext} from "react";
import GlobalContext from "./GlobalContext.ts";

export const useSelection = () => useContext(GlobalContext).selection