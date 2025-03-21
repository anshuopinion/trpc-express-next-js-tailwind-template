"use client";
import {Form, Formik, FieldProps, Field as FormikField} from "formik";
import * as Yup from "yup";
import AuthLayout from "@/layout/auth-layout/auth-layout";
import {trpc} from "@/trpc/client";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card} from "@/components/ui/card";
import Link from "next/link";
import {EyeIcon, EyeOffIcon, Loader2} from "lucide-react";
import {useState} from "react";
import {useRouter} from "next/navigation";

function Signup() {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

	return (
		<AuthLayout>
			<Card className='min-h-[410px] flex-1 p-8 shadow-lg'>
				<div className='space-y-6 max-w-full  '>
					<div className='text-center mb-6'>
						<h2 className='text-2xl font-bold tracking-tight'>Create an account</h2>
						<p className='text-sm text-muted-foreground mt-1'>Enter your information to get started</p>
					</div>

					<Formik
						validationSchema={Yup.object({
							email: Yup.string().email("Please enter a valid email address").required("Email is required"),
							password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
							first_name: Yup.string().required("First name is required"),
							last_name: Yup.string().required("Last name is required"),
							confirmPassword: Yup.string()
								.oneOf([Yup.ref("password"), ""], "Passwords must match")
								.required("Please confirm your password"),
						})}
						initialValues={{
							email: "",
							password: "",
							first_name: "",
							last_name: "",
							confirmPassword: "",
						}}
						onSubmit={async values => {
							signupUserMutation.mutate({
								email: values.email,
								password: values.password,
								first_name: values.first_name,
								last_name: values.last_name,
							});
						}}
					>
						<Form className='space-y-5 w-full'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<FormikField name='first_name'>
									{({field, meta}: FieldProps) => (
										<div className='space-y-2'>
											<Label htmlFor='first_name'>First Name</Label>
											<Input
												id='first_name'
												placeholder='John'
												{...field}
												className={meta.touched && meta.error ? "border-destructive" : ""}
												autoComplete='given-name'
											/>
											{meta.touched && meta.error && <p className='text-sm text-destructive'>{meta.error}</p>}
										</div>
									)}
								</FormikField>

								<FormikField name='last_name'>
									{({field, meta}: FieldProps) => (
										<div className='space-y-2'>
											<Label htmlFor='last_name'>Last Name</Label>
											<Input
												id='last_name'
												placeholder='Doe'
												{...field}
												className={meta.touched && meta.error ? "border-destructive" : ""}
												autoComplete='family-name'
											/>
											{meta.touched && meta.error && <p className='text-sm text-destructive'>{meta.error}</p>}
										</div>
									)}
								</FormikField>
							</div>

							<FormikField name='email'>
								{({field, meta}: FieldProps) => (
									<div className='space-y-2'>
										<Label htmlFor='email'>Email</Label>
										<Input
											id='email'
											type='email'
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
										<Label htmlFor='password'>Password</Label>
										<div className='relative'>
											<Input
												id='password'
												type={showPassword ? "text" : "password"}
												placeholder='••••••••'
												{...field}
												className={meta.touched && meta.error ? "border-destructive pr-10" : "pr-10"}
												autoComplete='new-password'
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

							<FormikField name='confirmPassword'>
								{({field, meta}: FieldProps) => (
									<div className='space-y-2'>
										<Label htmlFor='confirmPassword'>Confirm Password</Label>
										<div className='relative'>
											<Input
												id='confirmPassword'
												type={showConfirmPassword ? "text" : "password"}
												placeholder='••••••••'
												{...field}
												className={meta.touched && meta.error ? "border-destructive pr-10" : "pr-10"}
												autoComplete='new-password'
											/>
											<button
												type='button'
												className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
												onClick={() => setShowConfirmPassword(!showConfirmPassword)}
											>
												{showConfirmPassword ? <EyeOffIcon className='h-4 w-4' /> : <EyeIcon className='h-4 w-4' />}
											</button>
										</div>
										{meta.touched && meta.error && <p className='text-sm text-destructive'>{meta.error}</p>}
									</div>
								)}
							</FormikField>

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
						</Form>
					</Formik>
				</div>
			</Card>
		</AuthLayout>
	);
}

export default Signup;
