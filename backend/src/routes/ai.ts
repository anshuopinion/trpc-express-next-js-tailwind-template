import {z} from "zod";
import {publicProcedure, router} from "../trpc";
import {TRPCError} from "@trpc/server";
import OpenAI from "openai";
import {OPENAI_API_KEY} from "../config";

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY,
});

export const aiRouter = router({
	generateText: publicProcedure
		.input(
			z.object({
				prompt: z.string({required_error: "Prompt is required"}),
				model: z.string().optional().default("gpt-3.5-turbo"),
				temperature: z.number().min(0).max(2).optional().default(0.7),
			})
		)
		.mutation(async ({input}) => {
			try {
				const {prompt, model, temperature} = input;

				const response = await openai.chat.completions.create({
					model,
					temperature,
					messages: [
						{role: "system", content: "You are a helpful assistant specialized in creating content for freelancers."},
						{role: "user", content: prompt},
					],
				});

				const content = response.choices[0]?.message?.content?.trim() || "";

				return {
					content,
					model: response.model,
					usage: response.usage,
				};
			} catch (error: any) {
				console.error("OpenAI API error:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to generate content",
					cause: error,
				});
			}
		}),

	generateGigTitles: publicProcedure
		.input(
			z.object({
				keywords: z.string({required_error: "Keywords are required"}),
				count: z.number().min(1).max(10).optional().default(3),
			})
		)
		.mutation(async ({input}) => {
			try {
				const {keywords, count} = input;

				const prompt = `Generate ${count} catchy and professional titles for a freelance gig about ${keywords}. 
        Each title should start with "I will" and should be concise, specific, and appealing to potential clients. 
        Format the response as a simple list without numbering.`;

				const response = await openai.chat.completions.create({
					model: "gpt-3.5-turbo",
					temperature: 0.8,
					messages: [
						{role: "system", content: "You are a marketing expert that helps freelancers craft engaging gig titles."},
						{role: "user", content: prompt},
					],
				});

				const content = response.choices[0]?.message?.content?.trim() || "";

				// Parse the content into separate titles
				const titles = content
					.split("\n")
					.filter(line => line.trim().startsWith("I will"))
					.map(line => line.trim())
					.slice(0, count);

				return {titles};
			} catch (error: any) {
				console.error("OpenAI API error:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to generate gig titles",
					cause: error,
				});
			}
		}),

	generateGigContent: publicProcedure
		.input(
			z.object({
				prompt: z.string({required_error: "Prompt is required"}),
				field: z.string({required_error: "Field identifier is required"}),
				context: z
					.object({
						title: z.string().optional(),
						category: z
							.object({
								main: z.string().optional(),
								sub: z.string().optional(),
							})
							.optional(),
						existing: z.any().optional(),
					})
					.optional(),
			})
		)
		.mutation(async ({input}) => {
			try {
				const {prompt, field, context} = input;

				// Enhance the prompt with context
				let enhancedPrompt = prompt;
				if (context?.title) {
					enhancedPrompt += `\n\nThis is for a gig titled: "${context.title}"`;
				}

				if (context?.category?.main && context?.category?.sub) {
					enhancedPrompt += `\nCategory: ${context.category.main} > ${context.category.sub}`;
				}

				// Use different system prompts based on the field
				let systemPrompt = "You are a helpful assistant specialized in creating content for freelancers.";

				if (field === "title") {
					systemPrompt = "You are a marketing expert that helps freelancers craft engaging gig titles. Keep titles concise and start with 'I will'.";
				} else if (field === "description") {
					systemPrompt = "You are a copywriter specialized in writing compelling service descriptions that convert visitors to customers.";
				} else if (field === "searchTags") {
					systemPrompt = "You generate relevant search keywords for online services. Provide a comma-separated list of 5-10 keywords.";
				} else if (field.includes("packages")) {
					systemPrompt = "You create compelling package descriptions for freelance services, highlighting the value and benefits.";
				}

				const response = await openai.chat.completions.create({
					model: "gpt-3.5-turbo",
					temperature: 0.7,
					messages: [
						{role: "system", content: systemPrompt},
						{role: "user", content: enhancedPrompt},
					],
				});

				const content = response.choices[0]?.message?.content?.trim() || "";

				return {content, field};
			} catch (error: any) {
				console.error("OpenAI API error:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to generate content",
					cause: error,
				});
			}
		}),
});
