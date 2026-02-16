import { useContext } from "react";
import { ToastContext } from "../context/ToastContext";

export const useToastContext = () => {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error(
			"useToastContext deve ser usado dentro de um ToastProvider",
		);
	}
	return context;
};
