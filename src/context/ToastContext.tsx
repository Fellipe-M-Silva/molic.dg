import React, { createContext, useCallback, useState } from 'react';
import { ToastContainer } from '../components/Toast/Toast';
import type { Toast as ToastType } from '../components/Toast/Toast';

export interface ToastContextType {
	toasts: ToastType[];
	removeToast: (id: string) => void;
	addToast: (
		message: string,
		type: ToastType['type'],
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

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [toasts, setToasts] = useState<ToastType[]>([]);

	const addToast = useCallback(
		(
			message: string,
			type: ToastType['type'] = 'info',
			duration = 3000,
		): string => {
			const id = Date.now().toString();
			const newToast: ToastType = { id, message, type, duration };
			setToasts((prev) => [...prev, newToast]);
			return id;
		},
		[],
	);

	const removeToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
	}, []);

	const loading = useCallback(
		(message: string) => addToast(message, 'loading', 0),
		[addToast],
	);
	const success = useCallback(
		(message: string, duration = 3000) =>
			addToast(message, 'success', duration),
		[addToast],
	);
	const error = useCallback(
		(message: string, duration = 5000) =>
			addToast(message, 'error', duration),
		[addToast],
	);
	const info = useCallback(
		(message: string, duration = 3000) =>
			addToast(message, 'info', duration),
		[addToast],
	);
	const warning = useCallback(
		(message: string, duration = 4000) =>
			addToast(message, 'warning', duration),
		[addToast],
	);

	const value: ToastContextType = {
		toasts,
		removeToast,
		addToast,
		loading,
		success,
		error,
		info,
		warning,
	};

	return (
		<ToastContext.Provider value={value}>
			{children}
			<ToastContainer toasts={toasts} onRemove={removeToast} />
		</ToastContext.Provider>
	);
};
