import { useState, useEffect, useRef } from "react";
import { parseMolic, type ParsingError } from "../core/parser";

export const useValidation = (code: string, debounceMs: number = 800) => {
	const [error, setError] = useState<ParsingError | null>(null);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		// Limpar timeout anterior se existir
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		// Se estiver vazio, não há erro
		if (!code.trim()) {
			setError(null);
			return;
		}

		// Agendar validação após debounce
		timeoutRef.current = setTimeout(() => {
			const { error: parseError } = parseMolic(code);
			setError(parseError);
		}, debounceMs);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [code, debounceMs]);

	return error;
};
