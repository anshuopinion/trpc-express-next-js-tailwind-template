import {useState} from "react";
import {trpc} from "@/trpc/client";

interface UseAIGenerationProps<T> {
	onSuccess?: (data: T) => void;
	onError?: (error: Error) => void;
}

export function useAIGeneration<T>({onSuccess, onError}: UseAIGenerationProps<T> = {}) {
	const [isGenerating, setIsGenerating] = useState(false);
	const [result, setResult] = useState<T | null>(null);
	const [error, setError] = useState<Error | null>(null);

	const generateText = trpc.ai.generateText.useMutation({
		onSuccess: data => {
			setResult(data as unknown as T);
			setIsGenerating(false);
			onSuccess?.(data as unknown as T);
		},
		onError: err => {
			setError(err);
			setIsGenerating(false);
			onError?.(err);
		},
	});

	const generateGigTitles = trpc.ai.generateGigTitles.useMutation({
		onSuccess: data => {
			setResult(data as unknown as T);
			setIsGenerating(false);
			onSuccess?.(data as unknown as T);
		},
		onError: err => {
			setError(err);
			setIsGenerating(false);
			onError?.(err);
		},
	});

	const generateGigContent = trpc.ai.generateGigContent.useMutation({
		onSuccess: data => {
			setResult(data as unknown as T);
			setIsGenerating(false);
			onSuccess?.(data as unknown as T);
		},
		onError: err => {
			setError(err);
			setIsGenerating(false);
			onError?.(err);
		},
	});

	const generate = {
		text: (prompt: string, options?: {model?: string; temperature?: number}) => {
			setIsGenerating(true);
			setError(null);
			generateText.mutate({
				prompt,
				model: options?.model || "gpt-3.5-turbo",
				temperature: options?.temperature || 0.7,
			});
		},
		gigTitles: (keywords: string, count: number = 3) => {
			setIsGenerating(true);
			setError(null);
			generateGigTitles.mutate({keywords, count});
		},
		gigContent: (
			prompt: string,
			field: string,
			context?: {
				title?: string;
				category?: {main?: string; sub?: string};
				existing?: any;
			}
		) => {
			setIsGenerating(true);
			setError(null);
			generateGigContent.mutate({prompt, field, context});
		},
	};

	return {
		generate,
		isGenerating,
		result,
		error,
		clear: () => {
			setResult(null);
			setError(null);
		},
	};
}
