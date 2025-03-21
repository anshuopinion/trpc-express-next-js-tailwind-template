"use client";
import * as Yup from "yup";
import {Form, Formik, FieldProps} from "formik";
import {Field as FormikField} from "formik";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {Card} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {EyeIcon, EyeOffIcon, Loader2} from "lucide-react"; // Added Loader2 icon
import AuthLayout from "@/layout/auth-layout/auth-layout";
import {trpc} from "@/trpc/client";
import useUser from "../../../hooks/useUser";
import {toast} from "sonner";
import {useState} from "react";

function SigninPage() {
	const router = useRouter();
	const {logIn} = useUser();
	const [showPassword, setShowPassword] = useState(false);

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

	return (
		<AuthLayout>
			<Card className='min-h-[410px] flex-1 p-8 shadow-lg'>
				<div className='space-y-6  max-w-md '>
					<div className='text-center mb-6'>
						<h1 className='text-2xl font-bold tracking-tight'>Welcome back</h1>
						<p className='text-sm text-muted-foreground mt-1'>Enter your credentials to access your account</p>
					</div>

					<Formik
						validationSchema={Yup.object({
							email: Yup.string().email("Please enter a valid email address").required("Email is required"),
							password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
						})}
						initialValues={{
							email: "",
							password: "",
						}}
						onSubmit={async values => {
							signinUserMutation.mutate({
								email: values.email,
								password: values.password,
							});
						}}
					>
						<Form className='space-y-5'>
							<FormikField name='email'>
								{({field, meta}: FieldProps) => (
									<div className='space-y-2'>
										<Label htmlFor='email'>Email</Label>
										<Input
											id='email'
											placeholder='name@example.com'
											{...field}
											className={meta.touched && meta.error ? "border-destructive" : ""}
											autoComplete='email'
										/>
										{meta.touched && meta.error && <p className='text-sm text-destructive'>{meta.error}</p>}
									</div>
								)}
							</FormikField>

							<FormikField name='password'>
								{({field, meta}: FieldProps) => (
									<div className='space-y-2'>
										<div className='flex items-center justify-between'>
											<Label htmlFor='password'>Password</Label>
											<Link href='/forgot-password' className='text-sm text-primary hover:underline'>
												Forgot password?
											</Link>
										</div>
										<div className='relative'>
											<Input
												id='password'
												type={showPassword ? "text" : "password"}
												placeholder='••••••••'
												{...field}
												className={meta.touched && meta.error ? "border-destructive pr-10" : "pr-10"}
												autoComplete='current-password'
											/>
											<button
												type='button'
												className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
												onClick={() => setShowPassword(!showPassword)}
											>
												{showPassword ? <EyeOffIcon className='h-4 w-4' /> : <EyeIcon className='h-4 w-4' />}
											</button>
										</div>
										{meta.touched && meta.error && <p className='text-sm text-destructive'>{meta.error}</p>}
									</div>
								)}
							</FormikField>

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
						</Form>
					</Formik>
				</div>
			</Card>
		</AuthLayout>
	);
}

export default SigninPage;
