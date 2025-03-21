"use client";
import * as z from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import AuthLayout from "@/layout/auth-layout/auth-layout";
import {trpc} from "@/trpc/client";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card} from "@/components/ui/card";
import Link from "next/link";
import {EyeIcon, EyeOffIcon, Loader2} from "lucide-react";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";

// Create schema for form validation
const formSchema = z
	.object({
		first_name: z.string().min(1, "First name is required"),
		last_name: z.string().min(1, "Last name is required"),
		email: z.string().email("Please enter a valid email address"),
		password: z.string().min(6, "Password must be at least 6 characters"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine(data => data.password === data.confirmPassword, {
		message: "Passwords must match",
		path: ["confirmPassword"],
	});

function Signup() {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// Define form with react-hook-form
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			first_name: "",
			last_name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const signupUserMutation = trpc.auth.signup.useMutation({
		onSuccess: () => {
			toast.success("Account created successfully", {
				description: "You can now sign in with your credentials",
			});
			setTimeout(() => {
				router.push("/signin");
			}, 1500);
		},
		onError: err => {
			toast.error("Registration failed", {
				description: err.message,
			});
		},
	});

	// Form submission handler
	function onSubmit(values: z.infer<typeof formSchema>) {
		signupUserMutation.mutate({
			email: values.email,
			password: values.password,
			first_name: values.first_name,
			last_name: values.last_name,
		});
	}

	return (
		<AuthLayout>
			<Card className='min-h-[410px] flex-1 p-8 shadow-lg'>
				<div className='space-y-6 max-w-full'>
					<div className='text-center mb-6'>
						<h2 className='text-2xl font-bold tracking-tight'>Create an account</h2>
						<p className='text-sm text-muted-foreground mt-1'>Enter your information to get started</p>
					</div>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5 w-full'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<FormField
									control={form.control}
									name='first_name'
									render={({field}) => (
										<FormItem>
											<FormLabel>First Name</FormLabel>
											<FormControl>
												<Input {...field} placeholder='John' autoComplete='given-name' />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name='last_name'
									render={({field}) => (
										<FormItem>
											<FormLabel>Last Name</FormLabel>
											<FormControl>
												<Input {...field} placeholder='Doe' autoComplete='family-name' />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name='email'
								render={({field}) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input {...field} type='email' placeholder='name@example.com' autoComplete='email' />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='password'
								render={({field}) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<div className='relative'>
												<Input {...field} type={showPassword ? "text" : "password"} placeholder='••••••••' autoComplete='new-password' className='pr-10' />
												<button
													type='button'
													className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
													onClick={() => setShowPassword(!showPassword)}
												>
													{showPassword ? <EyeOffIcon className='h-4 w-4' /> : <EyeIcon className='h-4 w-4' />}
												</button>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='confirmPassword'
								render={({field}) => (
									<FormItem>
										<FormLabel>Confirm Password</FormLabel>
										<FormControl>
											<div className='relative'>
												<Input
													{...field}
													type={showConfirmPassword ? "text" : "password"}
													placeholder='••••••••'
													autoComplete='new-password'
													className='pr-10'
												/>
												<button
													type='button'
													className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
													onClick={() => setShowConfirmPassword(!showConfirmPassword)}
												>
													{showConfirmPassword ? <EyeOffIcon className='h-4 w-4' /> : <EyeIcon className='h-4 w-4' />}
												</button>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button className='w-full font-medium' type='submit' disabled={signupUserMutation.isPending}>
								{signupUserMutation.isPending ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Creating account...
									</>
								) : (
									"Create account"
								)}
							</Button>

							<div className='text-center text-sm'>
								<span className='text-muted-foreground'>Already have an account? </span>
								<Link href='/signin' className='text-primary font-medium hover:underline'>
									Sign in
								</Link>
							</div>
						</form>
					</Form>
				</div>
			</Card>
		</AuthLayout>
	);
}

export default Signup;
