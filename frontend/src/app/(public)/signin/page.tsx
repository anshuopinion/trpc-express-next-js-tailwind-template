"use client";
import * as z from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {Card} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {EyeIcon, EyeOffIcon, Loader2} from "lucide-react";
import AuthLayout from "@/layout/auth-layout/auth-layout";
import {trpc} from "@/trpc/client";
import useUser from "../../../hooks/useUser";
import {toast} from "sonner";
import {useState} from "react";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";

// Create a schema for form validation
const formSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

function SigninPage() {
	const router = useRouter();
	const {logIn} = useUser();
	const [showPassword, setShowPassword] = useState(false);

	// Define form with react-hook-form
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const signinUserMutation = trpc.auth.signin.useMutation({
		onSuccess: data => {
			logIn(data);
			toast.success("Login successful", {
				description: "Redirecting to dashboard...",
			});
			router.replace("/dashboard");
		},
		onError: err => {
			toast.error("Authentication failed", {
				description: err.message,
			});
		},
	});

	// Form submission handler
	function onSubmit(values: z.infer<typeof formSchema>) {
		signinUserMutation.mutate({
			email: values.email,
			password: values.password,
		});
	}

	return (
		<AuthLayout>
			<Card className='min-h-[410px] flex-1 p-8 shadow-lg'>
				<div className='space-y-6  max-w-md '>
					<div className='text-center mb-6'>
						<h1 className='text-2xl font-bold tracking-tight'>Welcome back</h1>
						<p className='text-sm text-muted-foreground mt-1'>Enter your credentials to access your account</p>
					</div>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
							<FormField
								control={form.control}
								name='email'
								render={({field}) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input {...field} placeholder='name@example.com' autoComplete='email' />
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
										<div className='flex items-center justify-between'>
											<FormLabel>Password</FormLabel>
											<Link href='/forgot-password' className='text-sm text-primary hover:underline'>
												Forgot password?
											</Link>
										</div>
										<FormControl>
											<div className='relative'>
												<Input {...field} type={showPassword ? "text" : "password"} placeholder='••••••••' autoComplete='current-password' className='pr-10' />
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

							<Button className='w-full font-medium' variant='default' type='submit' disabled={signinUserMutation.isPending}>
								{signinUserMutation.isPending ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Signing in...
									</>
								) : (
									"Sign in"
								)}
							</Button>

							<div className='text-center text-sm'>
								<span className='text-muted-foreground'>Don&apos;t have an account? </span>
								<Link href='/signup' className='text-primary font-medium hover:underline'>
									Create one now
								</Link>
							</div>
						</form>
					</Form>
				</div>
			</Card>
		</AuthLayout>
	);
}

export default SigninPage;
