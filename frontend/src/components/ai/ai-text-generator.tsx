"use client";

import {useState} from "react";
import {trpc} from "@/trpc/client";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {useToast} from "@/components/ui/use-toast";
import {Spinner} from "@/components/ui/spinner";

interface AITextGeneratorProps {
	onGenerated?: (text: string) => void;
	defaultPrompt?: string;
	title?: string;
	placeholder?: string;
	systemRole?: string;
}

export function AITextGenerator({
	onGenerated,
	defaultPrompt = "",
	title = "Generate Text with AI",
	placeholder = "Describe what you want to generate...",
	systemRole,
}: AITextGeneratorProps) {
	const {toast} = useToast();
	const [prompt, setPrompt] = useState(defaultPrompt);
	const [generatedText, setGeneratedText] = useState("");

	const generateText = trpc.ai.generateText.useMutation({
		onSuccess: data => {
			setGeneratedText(data.content);
			if (onGenerated) {
				onGenerated(data.content);
			}
		},
		onError: error => {
			toast({
				variant: "destructive",
				title: "Generation failed",
				description: error.message || "Failed to generate text. Please try again.",
			});
		},
	});

	const handleGenerate = () => {
		if (!prompt.trim()) {
			toast({
				variant: "destructive",
				title: "Empty prompt",
				description: "Please enter a prompt for the AI to generate text.",
			});
			return;
		}

		generateText.mutate({prompt});
	};

	const handleUseGenerated = () => {
		if (onGenerated && generatedText) {
			onGenerated(generatedText);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				<div>
					<Textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={placeholder} className='min-h-[100px]' />
				</div>

				<Button onClick={handleGenerate} disabled={generateText.isLoading || !prompt.trim()} className='w-full'>
					{generateText.isLoading ? (
						<>
							<Spinner className='mr-2 h-4 w-4' />
							Generating...
						</>
					) : (
						"Generate with AI"
					)}
				</Button>

				{generatedText && (
					<div className='mt-4 p-4 border rounded-md bg-muted'>
						<h3 className='text-sm font-medium mb-2'>Generated Text:</h3>
						<div className='text-sm whitespace-pre-wrap'>{generatedText}</div>
					</div>
				)}
			</CardContent>
			{generatedText && onGenerated && (
				<CardFooter>
					<Button variant='outline' onClick={handleUseGenerated} className='w-full'>
						Use This Text
					</Button>
				</CardFooter>
			)}
		</Card>
	);
}
