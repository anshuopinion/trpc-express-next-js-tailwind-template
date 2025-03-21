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
import {EyeIcon, EyeOffIcon} from "lucide-react"; // Import icons for password visibility
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
			router.replace("/dashboard");
		},
		onError: err => {
			toast("An error occurred.", {
				description: err.message,
				richColors: true,
				actionButtonStyle: {
					backgroundColor: "#F87171",
					color: "#fff",
				},
				action: {
					label: "Undo",
					onClick: () => console.log("Undo"),
				},
			});
		},
	});

	return (
		<AuthLayout>
			<Card className='min-h-[410px] flex-1 p-6'>
				<div className='space-y-4'>
					<h1 className='text-xl font-bold'>Sign In</h1>
					<div className='text-sm'>
						<span className='text-muted-foreground'>Don&apos;t have any account? </span>
						<Link href='/signup' className='text-primary underline'>
							Sign Up
						</Link>
					</div>

					<Formik
						validationSchema={Yup.object({
							email: Yup.string().email("Invalid email address").required("Required"),
							password: Yup.string().min(6, "Password must be at least 6 characters").required("Required"),
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
						<Form className='space-y-4 mt-4'>
							<FormikField name='email'>
								{({field, meta}: FieldProps) => (
									<div className='space-y-2'>
										<Label htmlFor='email'>Email</Label>
										<Input id='email' placeholder='me@example.com' {...field} className={meta.touched && meta.error ? "border-destructive" : ""} />
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
												placeholder='********'
												{...field}
												className={meta.touched && meta.error ? "border-destructive pr-10" : "pr-10"}
											/>
											<button type='button' className='absolute right-3 top-1/2 transform -translate-y-1/2' onClick={() => setShowPassword(!showPassword)}>
												{showPassword ? <EyeOffIcon className='h-4 w-4 text-muted-foreground' /> : <EyeIcon className='h-4 w-4 text-muted-foreground' />}
											</button>
										</div>
										{meta.touched && meta.error && <p className='text-sm text-destructive'>{meta.error}</p>}
									</div>
								)}
							</FormikField>

							{/* <div className="flex justify-end w-full">
								<Link href="/forgot-password" className="text-primary underline text-sm">
									Forgot Password?
								</Link>
							</div> */}

							<Button className='w-full text-sm' variant='default' type='submit' disabled={signinUserMutation.isPending}>
								{signinUserMutation.isPending ? "Signing in..." : "Sign In"}
							</Button>
						</Form>
					</Formik>
				</div>
			</Card>
		</AuthLayout>
	);
}

export default SigninPage;
