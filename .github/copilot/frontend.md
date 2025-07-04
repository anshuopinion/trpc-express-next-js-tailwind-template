# Frontend Development Guide

## Architecture Overview

The frontend is built with Next.js and uses tRPC client to communicate with the backend:

- **Next.js**: React framework for building server-rendered applications
- **tRPC client**: Type-safe client for making API calls to the backend
- **React Query**: Data fetching, caching, and state management
- **Tailwind CSS**: Utility-first CSS framework for styling

## Directory Structure

```
frontend/
├── src/
│   ├── app/              # Next.js app router
│   │   ├── page.tsx      # Home page
│   │   └── ...
│   ├── components/       # Reusable React components
│   ├── constant/         # App constants
│   ├── provider/         # React context providers
│   │   ├── trpc-wrapper.tsx  # tRPC provider setup
│   │   └── ...
│   ├── trpc/             # tRPC client setup
│   │   ├── client.ts     # tRPC client instance
│   │   └── utils/        # Helper utilities
│   └── ...
```

## Using tRPC Client

The tRPC client is configured in `src/trpc/client.ts` and wrapped in a provider in `src/provider/trpc-wrapper.tsx`. Use the client to make API calls to the backend:

### Queries

```tsx
import {trpc} from "@/trpc/client";

// In a React component
function UserProfile() {
	const {data, isLoading, error} = trpc.auth.me.useQuery();

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<div>
			<h1>Welcome, {data.first_name}</h1>
			<p>Email: {data.email}</p>
		</div>
	);
}
```

### Mutations

```tsx
import {trpc} from "@/trpc/client";
import {useState} from "react";

function CreateItemForm() {
	const [name, setName] = useState("");
	const utils = trpc.useUtils();

	const createItem = trpc.example.createItem.useMutation({
		onSuccess: () => {
			// Reset form
			setName("");
			// Invalidate queries to refresh data
			utils.example.getItems.invalidate();
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		createItem.mutate({name});
	};

	return (
		<form onSubmit={handleSubmit}>
			<input type='text' value={name} onChange={e => setName(e.target.value)} placeholder='Item name' />
			<button type='submit' disabled={createItem.isLoading}>
				{createItem.isLoading ? "Creating..." : "Create"}
			</button>
		</form>
	);
}
```

### Pagination Example

```tsx
import {trpc} from "@/trpc/client";
import {useState} from "react";

function PaginatedList() {
	const [cursor, setCursor] = useState<string | undefined>(undefined);

	const {data, isLoading, isFetching} = trpc.example.getPaginatedItems.useQuery({limit: 10, cursor});

	return (
		<div>
			{isLoading ? (
				<div>Loading...</div>
			) : (
				<>
					<ul>
						{data?.items.map(item => (
							<li key={item.id}>{item.name}</li>
						))}
					</ul>

					{data?.nextCursor && (
						<button onClick={() => setCursor(data.nextCursor)} disabled={isFetching}>
							Load More
						</button>
					)}
				</>
			)}
		</div>
	);
}
```

## AI-Powered Content Generation

This project includes AI-powered content generation capabilities using OpenAI's API through a tRPC interface. This enables dynamic content creation for various use cases including gig descriptions, marketing copy, and more.

### OpenAI Integration Components

The following examples demonstrate how to use the AI capabilities in your components:

#### Basic Text Generation

```tsx
import {useState} from "react";
import {trpc} from "@/trpc/client";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Spinner} from "@/components/ui/spinner";

function AITextGenerator() {
	const [prompt, setPrompt] = useState("");
	const [generatedText, setGeneratedText] = useState("");

	const generateText = trpc.ai.generateText.useMutation({
		onSuccess: data => {
			setGeneratedText(data.content);
		},
	});

	const handleGenerate = () => {
		generateText.mutate({prompt});
	};

	return (
		<div className='space-y-4'>
			<div>
				<label className='block text-sm font-medium mb-1'>Describe what you want to generate</label>
				<Textarea
					value={prompt}
					onChange={e => setPrompt(e.target.value)}
					placeholder='E.g., Write a professional description for my web development service...'
					className='min-h-[100px]'
				/>
			</div>

			<Button onClick={handleGenerate} disabled={generateText.isLoading || !prompt.trim()}>
				{generateText.isLoading ? (
					<>
						<Spinner className='mr-2' />
						Generating...
					</>
				) : (
					"Generate with AI"
				)}
			</Button>

			{generatedText && (
				<div className='mt-4 p-4 border rounded-md bg-gray-50'>
					<h3 className='text-sm font-medium mb-2'>Generated Text:</h3>
					<div className='text-sm'>{generatedText}</div>
				</div>
			)}
		</div>
	);
}
```

#### Gig Title Generator

```tsx
import {useState} from "react";
import {trpc} from "@/trpc/client";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardFooter} from "@/components/ui/card";

function GigTitleGenerator({onSelect}: {onSelect: (title: string) => void}) {
	const [keywords, setKeywords] = useState("");
	const [selectedTitle, setSelectedTitle] = useState("");

	const generateTitles = trpc.ai.generateGigTitles.useMutation();

	const handleGenerate = () => {
		generateTitles.mutate({keywords, count: 3});
	};

	const handleSelect = (title: string) => {
		setSelectedTitle(title);
		onSelect(title);
	};

	return (
		<div className='space-y-4'>
			<div className='space-y-2'>
				<Label htmlFor='keywords'>Keywords (separated by commas)</Label>
				<div className='flex space-x-2'>
					<Input id='keywords' value={keywords} onChange={e => setKeywords(e.target.value)} placeholder='web development, react, nextjs' />
					<Button onClick={handleGenerate} disabled={generateTitles.isLoading || !keywords.trim()}>
						{generateTitles.isLoading ? "Generating..." : "Generate"}
					</Button>
				</div>
			</div>

			{generateTitles.data && (
				<div className='grid gap-4 mt-4'>
					<h3 className='text-sm font-medium'>Choose a title:</h3>
					{generateTitles.data.titles.map((title, index) => (
						<Card
							key={index}
							className={`cursor-pointer transition-all ${
								selectedTitle === title ? "border-primary ring-2 ring-primary ring-opacity-50" : "hover:border-gray-300"
							}`}
							onClick={() => handleSelect(title)}
						>
							<CardContent className='pt-4'>
								<p>{title}</p>
							</CardContent>
							<CardFooter>
								<Button
									variant='ghost'
									size='sm'
									onClick={e => {
										e.stopPropagation();
										handleSelect(title);
									}}
								>
									Select
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
```

#### Complete Gig Generator Form

```tsx
import {useState} from "react";
import {trpc} from "@/trpc/client";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useToast} from "@/components/ui/use-toast";

const CATEGORIES = [
	{main: "Programming & Tech", subs: ["Web Development", "Mobile Apps", "Desktop Applications"]},
	{main: "Graphics & Design", subs: ["Logo Design", "Brand Identity", "Illustrations"]},
	{main: "Digital Marketing", subs: ["Social Media", "SEO", "Content Marketing"]},
];

export default function CreateGigPage() {
	const {toast} = useToast();
	const [formData, setFormData] = useState({
		title: "",
		category: {main: "", sub: ""},
		description: "",
		searchTags: [],
		packages: {
			basic: {title: "", description: "", price: 5},
			standard: {title: "", description: "", price: 15},
			premium: {title: "", description: "", price: 25},
		},
	});

	const [currentPrompt, setCurrentPrompt] = useState("");
	const [currentField, setCurrentField] = useState<string | null>(null);

	const generateContent = trpc.ai.generateGigContent.useMutation({
		onSuccess: data => {
			if (!currentField) return;

			if (currentField === "title") {
				setFormData(prev => ({...prev, title: data.content}));
			} else if (currentField === "description") {
				setFormData(prev => ({...prev, description: data.content}));
			} else if (currentField === "searchTags") {
				setFormData(prev => ({
					...prev,
					searchTags: data.content.split(",").map(tag => tag.trim()),
				}));
			} else if (currentField.startsWith("packages.")) {
				const [_, packageType, field] = currentField.split(".");
				setFormData(prev => ({
					...prev,
					packages: {
						...prev.packages,
						[packageType]: {
							...prev.packages[packageType as keyof typeof prev.packages],
							[field]: data.content,
						},
					},
				}));
			}

			toast({
				title: "Content Generated",
				description: `Successfully generated content for ${currentField}`,
			});

			setCurrentField(null);
			setCurrentPrompt("");
		},
		onError: () => {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to generate content. Please try again.",
			});
		},
	});

	const handleGenerate = (field: string, context?: string) => {
		setCurrentField(field);

		let prompt = currentPrompt;
		if (context) {
			prompt = context;
		}

		if (!prompt.trim()) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Please enter a prompt for generation",
			});
			return;
		}

		generateContent.mutate({
			prompt,
			field,
			context: {
				title: formData.title,
				category: formData.category,
				existing: field.includes(".") ? formData.packages[field.split(".")[1] as keyof typeof formData.packages] : null,
			},
		});
	};

	const saveGig = trpc.gigs.create.useMutation({
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Your gig has been created successfully!",
			});
			// Redirect or reset form
		},
	});

	const handleSaveGig = () => {
		saveGig.mutate(formData);
	};

	return (
		<div className='container mx-auto py-8'>
			<Card>
				<CardHeader>
					<CardTitle>Create New Gig with AI Assistance</CardTitle>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue='basics'>
						<TabsList className='grid w-full grid-cols-4'>
							<TabsTrigger value='basics'>Basic Info</TabsTrigger>
							<TabsTrigger value='description'>Description</TabsTrigger>
							<TabsTrigger value='packages'>Packages</TabsTrigger>
							<TabsTrigger value='preview'>Preview</TabsTrigger>
						</TabsList>

						<TabsContent value='basics' className='space-y-6 pt-4'>
							<div className='space-y-2'>
								<Label htmlFor='title'>Gig Title</Label>
								<div className='flex gap-2'>
									<Input
										id='title'
										value={formData.title}
										onChange={e => setFormData(prev => ({...prev, title: e.target.value}))}
										placeholder='I will...'
										className='flex-1'
									/>
									<Button
										onClick={() =>
											handleGenerate("title", "Generate a catchy gig title for a freelance service offering web development with React, Next.js and Chakra UI")
										}
										disabled={generateContent.isLoading}
									>
										{generateContent.isLoading && currentField === "title" ? "Generating..." : "Generate"}
									</Button>
								</div>
							</div>

							<div className='grid grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label>Category</Label>
									<Select
										value={formData.category.main}
										onValueChange={value =>
											setFormData(prev => ({
												...prev,
												category: {main: value, sub: ""},
											}))
										}
									>
										<SelectTrigger>
											<SelectValue placeholder='Select category' />
										</SelectTrigger>
										<SelectContent>
											{CATEGORIES.map(category => (
												<SelectItem key={category.main} value={category.main}>
													{category.main}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className='space-y-2'>
									<Label>Subcategory</Label>
									<Select
										value={formData.category.sub}
										onValueChange={value =>
											setFormData(prev => ({
												...prev,
												category: {...prev.category, sub: value},
											}))
										}
										disabled={!formData.category.main}
									>
										<SelectTrigger>
											<SelectValue placeholder='Select subcategory' />
										</SelectTrigger>
										<SelectContent>
											{formData.category.main &&
												CATEGORIES.find(c => c.main === formData.category.main)?.subs.map(sub => (
													<SelectItem key={sub} value={sub}>
														{sub}
													</SelectItem>
												))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className='space-y-2'>
								<Label>Search Tags</Label>
								<div className='flex gap-2'>
									<Input
										value={formData.searchTags.join(", ")}
										onChange={e =>
											setFormData(prev => ({
												...prev,
												searchTags: e.target.value.split(",").map(tag => tag.trim()),
											}))
										}
										placeholder='react, nextjs, chakra ui'
										className='flex-1'
									/>
									<Button
										onClick={() =>
											handleGenerate("searchTags", `Generate 5 search tags for a gig about ${formData.title || "web development with React and Next.js"}`)
										}
										disabled={generateContent.isLoading}
									>
										{generateContent.isLoading && currentField === "searchTags" ? "Generating..." : "Generate"}
									</Button>
								</div>
							</div>
						</TabsContent>

						<TabsContent value='description' className='space-y-6 pt-4'>
							<div className='space-y-2'>
								<Label htmlFor='description'>Gig Description</Label>
								<Textarea
									id='description'
									value={formData.description}
									onChange={e => setFormData(prev => ({...prev, description: e.target.value}))}
									placeholder='Describe your service in detail...'
									className='min-h-[200px]'
								/>
								<div className='flex gap-2 pt-2'>
									<Input
										placeholder='Enter your own prompt for generation'
										value={currentPrompt}
										onChange={e => setCurrentPrompt(e.target.value)}
										className='flex-1'
									/>
									<Button
										onClick={() => handleGenerate("description")}
										disabled={generateContent.isLoading || (!currentPrompt && currentField === "description")}
									>
										{generateContent.isLoading && currentField === "description" ? "Generating..." : "Generate"}
									</Button>
								</div>
								<div className='pt-2'>
									<Button
										variant='outline'
										onClick={() =>
											handleGenerate(
												"description",
												`Write a professional and compelling description for a freelance gig titled "${
													formData.title || "Web Development Service"
												}". Focus on expertise in React, Next.js, and Chakra UI. Include mentions of responsive design, clean code, and on-time delivery. The description should be approximately 250 words and highlight my dedication to quality and client satisfaction.`
											)
										}
										disabled={generateContent.isLoading}
										className='w-full'
									>
										Generate Standard Description
									</Button>
								</div>
							</div>
						</TabsContent>

						<TabsContent value='packages' className='pt-4'>
							<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
								{["basic", "standard", "premium"].map(pkg => (
									<Card key={pkg}>
										<CardHeader>
											<CardTitle className='capitalize'>{pkg} Package</CardTitle>
										</CardHeader>
										<CardContent className='space-y-4'>
											<div className='space-y-2'>
												<Label>Title</Label>
												<Input
													value={formData.packages[pkg as keyof typeof formData.packages].title}
													onChange={e =>
														setFormData(prev => ({
															...prev,
															packages: {
																...prev.packages,
																[pkg]: {
																	...prev.packages[pkg as keyof typeof formData.packages],
																	title: e.target.value,
																},
															},
														}))
													}
													placeholder='Package title'
												/>
												<Button
													size='sm'
													variant='outline'
													onClick={() =>
														handleGenerate(
															`packages.${pkg}.title`,
															`Generate a catchy title for the ${pkg} package of my ${
																formData.title || "web development"
															} service. Keep it short and appealing.`
														)
													}
													disabled={generateContent.isLoading}
													className='w-full mt-1'
												>
													{generateContent.isLoading && currentField === `packages.${pkg}.title` ? "Generating..." : "Generate Title"}
												</Button>
											</div>

											<div className='space-y-2'>
												<Label>Description</Label>
												<Textarea
													value={formData.packages[pkg as keyof typeof formData.packages].description}
													onChange={e =>
														setFormData(prev => ({
															...prev,
															packages: {
																...prev.packages,
																[pkg]: {
																	...prev.packages[pkg as keyof typeof formData.packages],
																	description: e.target.value,
																},
															},
														}))
													}
													placeholder='Package description'
													rows={4}
												/>
												<Button
													size='sm'
													variant='outline'
													onClick={() =>
														handleGenerate(
															`packages.${pkg}.description`,
															`Write a concise description for the ${pkg} package of my ${
																formData.title || "web development"
															} service. For the ${pkg} package, focus on ${
																pkg === "basic"
																	? "essential features and quick delivery"
																	: pkg === "standard"
																	? "balanced features and good value"
																	: "premium features and comprehensive service"
															}. Keep it under 50 words.`
														)
													}
													disabled={generateContent.isLoading}
													className='w-full mt-1'
												>
													{generateContent.isLoading && currentField === `packages.${pkg}.description` ? "Generating..." : "Generate Description"}
												</Button>
											</div>

											<div className='space-y-2'>
												<Label>Price ($)</Label>
												<Input
													type='number'
													value={formData.packages[pkg as keyof typeof formData.packages].price}
													onChange={e =>
														setFormData(prev => ({
															...prev,
															packages: {
																...prev.packages,
																[pkg]: {
																	...prev.packages[pkg as keyof typeof formData.packages],
																	price: parseInt(e.target.value) || 0,
																},
															},
														}))
													}
													min='5'
												/>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</TabsContent>

						<TabsContent value='preview' className='pt-4'>
							<Card>
								<CardContent className='pt-6'>
									<div className='space-y-6'>
										<div>
											<h3 className='text-lg font-bold'>{formData.title || "No title yet"}</h3>
											<div className='text-sm text-gray-500'>
												{formData.category.main && formData.category.sub ? `${formData.category.main} › ${formData.category.sub}` : "No category selected"}
											</div>
										</div>

										{formData.description && (
											<div>
												<h4 className='font-medium mb-2'>Description</h4>
												<div className='prose prose-sm max-w-none'>
													{formData.description.split("\n").map((paragraph, i) => (
														<p key={i}>{paragraph}</p>
													))}
												</div>
											</div>
										)}

										<div>
											<h4 className='font-medium mb-2'>Packages</h4>
											<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
												{["basic", "standard", "premium"].map(pkg => (
													<Card key={pkg} className='overflow-hidden'>
														<div className='bg-muted py-2 px-4 font-medium capitalize'>
															{formData.packages[pkg as keyof typeof formData.packages].title || pkg}
														</div>
														<CardContent className='p-4'>
															<div className='mb-4'>
																<span className='text-2xl font-bold'>${formData.packages[pkg as keyof typeof formData.packages].price}</span>
															</div>
															<p className='text-sm'>{formData.packages[pkg as keyof typeof formData.packages].description || "No description yet"}</p>
														</CardContent>
													</Card>
												))}
											</div>
										</div>

										{formData.searchTags.length > 0 && (
											<div>
												<h4 className='font-medium mb-2'>Tags</h4>
												<div className='flex flex-wrap gap-2'>
													{formData.searchTags.map((tag, index) => (
														<span key={index} className='px-2 py-1 bg-muted rounded-full text-xs'>
															{tag}
														</span>
													))}
												</div>
											</div>
										)}
									</div>
								</CardContent>
							</Card>

							<div className='mt-6 flex justify-end'>
								<Button size='lg' onClick={handleSaveGig} disabled={saveGig.isLoading || !formData.title}>
									{saveGig.isLoading ? "Saving..." : "Create Gig"}
								</Button>
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
```

### AI Provider Configuration

To set up the OpenAI integration on the backend, see the dedicated guide in the Backend Development Guide. The frontend interacts with these AI capabilities through the tRPC API without directly accessing the OpenAI SDK.

## Authentication in Components

Authentication state can be accessed using the tRPC client:

```tsx
function AuthenticatedContent() {
	const {data: user, isLoading} = trpc.auth.me.useQuery();

	if (isLoading) return <div>Loading...</div>;
	if (!user) return <div>Please log in</div>;

	return <div>Welcome, {user.first_name}!</div>;
}
```

## Form Handling with React Hook Form

```tsx
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {trpc} from "@/trpc/client";

// Define validation schema
const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
	const {
		register,
		handleSubmit,
		formState: {errors},
	} = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
	});

	const login = trpc.auth.signin.useMutation();

	const onSubmit = (data: LoginFormValues) => {
		login.mutate(data);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div>
				<label>Email</label>
				<input {...register("email")} type='email' />
				{errors.email && <p>{errors.email.message}</p>}
			</div>

			<div>
				<label>Password</label>
				<input {...register("password")} type='password' />
				{errors.password && <p>{errors.password.message}</p>}
			</div>

			<button type='submit' disabled={login.isLoading}>
				{login.isLoading ? "Logging in..." : "Login"}
			</button>
		</form>
	);
}
```

## State Management with Zustand

```tsx
import {create} from "zustand";

interface AppState {
	theme: "light" | "dark";
	setTheme: (theme: "light" | "dark") => void;
}

export const useAppStore = create<AppState>(set => ({
	theme: "light",
	setTheme: theme => set({theme}),
}));

// Using the store in a component
function ThemeToggle() {
	const {theme, setTheme} = useAppStore();

	return <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>Toggle to {theme === "light" ? "Dark" : "Light"} Mode</button>;
}
```

## Component Design Patterns

### Composition Pattern

```tsx
// Button component
function Button({children, ...props}) {
	return (
		<button className='px-4 py-2 bg-blue-500 text-white rounded' {...props}>
			{children}
		</button>
	);
}

// Using the button
function LoginButton() {
	return <Button>Login</Button>;
}
```

### Container/Presenter Pattern

```tsx
// Presenter component (UI only)
function UserListView({users, isLoading, error}) {
	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<ul>
			{users.map(user => (
				<li key={user.id}>
					{user.first_name} {user.last_name}
				</li>
			))}
		</ul>
	);
}

// Container component (data fetching)
function UserListContainer() {
	const {data, isLoading, error} = trpc.users.getAll.useQuery();

	return <UserListView users={data || []} isLoading={isLoading} error={error} />;
}
```

## Styling with Tailwind CSS

Follow these patterns for consistent styling:

```tsx
// Button variants
function Button({variant, size, children, ...props}) {
	const baseClasses = "rounded focus:outline-none focus:ring-2";

	const variantClasses = {
		primary: "bg-blue-500 text-white hover:bg-blue-600",
		secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
		danger: "bg-red-500 text-white hover:bg-red-600",
	}[variant || "primary"];

	const sizeClasses = {
		sm: "px-2 py-1 text-sm",
		md: "px-4 py-2",
		lg: "px-6 py-3 text-lg",
	}[size || "md"];

	return (
		<button className={`${baseClasses} ${variantClasses} ${sizeClasses}`} {...props}>
			{children}
		</button>
	);
}
```
