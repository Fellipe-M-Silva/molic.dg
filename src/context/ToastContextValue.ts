import { createContext } from "react";
import type { Toast as ToastType } from "../components/Toast/Toast";

export interface ToastContextType {
	toasts: ToastType[];
	removeToast: (id: string) => void;
	addToast: (
		message: string,
		type: ToastType["type"],
		duration?: number,
	) => string;
	loading: (message: string) => string;
	success: (message: string, duration?: number) => string;
	error: (message: string, duration?: number) => string;
	info: (message: string, duration?: number) => string;
	warning: (message: string, duration?: number) => string;
}

export const ToastContext = createContext<ToastContextType | undefined>(
	undefined,
);
