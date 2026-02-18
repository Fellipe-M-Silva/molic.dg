import { createContext } from "react";
import { type ReconnectionContextType } from "./ReconnectionContextType";

export const ReconnectionContext = createContext<
	ReconnectionContextType | undefined
>(undefined);
