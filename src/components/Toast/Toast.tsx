import React, { useEffect } from 'react';
import {
	CheckCircle,
	XCircle,
	Info,
	Warning,
} from '@phosphor-icons/react';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

export interface Toast {
	id: string;
	type: ToastType;
	message: string;
	duration?: number;
}

interface ToastComponentProps {
	toast: Toast;
	onRemove: (id: string) => void;
}

const ToastComponent: React.FC<ToastComponentProps> = ({ toast, onRemove }) => {
	useEffect(() => {
		if (toast.duration && toast.duration > 0) {
			const timer = setTimeout(() => {
				onRemove(toast.id);
			}, toast.duration);
			return () => clearTimeout(timer);
		}
	}, [toast, onRemove]);

	const getIcon = () => {
		switch (toast.type) {
			case 'success':
				return <CheckCircle size={20} weight="fill" />;
			case 'error':
				return <XCircle size={20} weight="fill" />;
			case 'warning':
				return <Warning size={20} weight="fill" />;
			case 'info':
				return <Info size={20} weight="fill" />;
			case 'loading':
				return <div className="toast-spinner" />;
		}
	};

	return (
		<div className={`toast toast-${toast.type}`}>
			<div className="toast-icon">{getIcon()}</div>
			<div className="toast-message">{toast.message}</div>
			{toast.type !== 'loading' && (
				<button
					className="toast-close"
					onClick={() => onRemove(toast.id)}
					aria-label="Fechar notificação"
				>
					✕
				</button>
			)}
		</div>
	);
};

interface ToastContainerProps {
	toasts: Toast[];
	onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
	toasts,
	onRemove,
}) => {
	return (
		<div className="toast-container">
			{toasts.map((toast) => (
				<ToastComponent
					key={toast.id}
					toast={toast}
					onRemove={onRemove}
				/>
			))}
		</div>
	);
};
