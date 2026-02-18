import { useContext } from "react";
import { ReconnectionContext } from "../context/ReconnectionContextValue";
import { type ReconnectionContextType } from "../context/ReconnectionContextType";

export const useReconnectionContext = (): ReconnectionContextType => {
	const context = useContext(ReconnectionContext);
	if (!context) {
		throw new Error(
			"useReconnectionContext deve ser usado dentro de ReconnectionProvider",
		);
	}
	return context;
};
