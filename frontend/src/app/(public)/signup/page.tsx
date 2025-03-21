"use client";
import {Form, Formik, FieldProps, Field as FormikField} from "formik";
import * as Yup from "yup";
import AuthLayout from "@/layout/auth-layout/auth-layout";
import {trpc} from "@/trpc/client";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent} from "@/components/ui/card";
import Link from "next/link";
import {EyeIcon, EyeOffIcon} from "lucide-react";
import {useState} from "react";

function Signup() {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const signupUserMutation = trpc.auth.signup.useMutation({
		onSuccess: () => {
			toast.success("Account created successfully");
		},
		onError: err => {
			toast.error(`An error occurred: ${err.message}`);
		},
	});

	return (
		<AuthLayout>
			<Card className='min-h-[410px] pb-4 flex-1'>
				<CardContent className='py-3 px-4'>
					<div className='space-y-2'>
						<h2 className='text-xl font-bold'>Sign Up</h2>
						<div className='text-sm'>
							<span className='text-gray-500'>Do you have account already? </span>
							<Link href='/signin' className='text-primary underline'>
								Sign In
							</Link>
						</div>

						<Formik
							validationSchema={Yup.object({
								email: Yup.string().email("Invalid email address").required("Required"),
								password: Yup.string().min(6, "Password must be at least 6 characters").required("Required"),
								first_name: Yup.string().required("Required"),
								last_name: Yup.string().required("Required"),
								confirmPassword: Yup.string()
									.oneOf([Yup.ref("password"), ""], "Passwords must match")
									.required("Required"),
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
							<Form>
								<div className='grid grid-cols-2 gap-4 mt-4'></div>
								<div className='col-span-2 md:col-span-1'>
									<FormikField name='first_name'>
										{({field, meta}: FieldProps) => (
											<div className='space-y-2'>
												<Label htmlFor='first_name'>First Name</Label>
												<Input id='first_name' placeholder='Anshu' {...field} className={meta.touched && meta.error ? "border-red-500" : ""} />
												{meta.touched && meta.error && <p className='text-sm text-red-500'>{meta.error}</p>}
											</div>
										)}
									</FormikField>
								</div>

								<div className='col-span-2 md:col-span-1'>
									<FormikField name='last_name'>
										{({field, meta}: FieldProps) => (
											<div className='space-y-2'>
												<Label htmlFor='last_name'>Last Name</Label>
												<Input id='last_name' placeholder='Raj' {...field} className={meta.touched && meta.error ? "border-red-500" : ""} />
												{meta.touched && meta.error && <p className='text-sm text-red-500'>{meta.error}</p>}
											</div>
										)}
									</FormikField>
								</div>

								<div className='col-span-2'>
									<FormikField name='email'>
										{({field, meta}: FieldProps) => (
											<div className='space-y-2'>
												<Label htmlFor='email'>Email</Label>
												<Input id='email' type='email' placeholder='me@example.com' {...field} className={meta.touched && meta.error ? "border-red-500" : ""} />
												{meta.touched && meta.error && <p className='text-sm text-red-500'>{meta.error}</p>}
											</div>
										)}
									</FormikField>
								</div>

								<div className='col-span-2'>
									<FormikField name='password'>
										{({field, meta}: FieldProps) => (
											<div className='space-y-2'>
												<Label htmlFor='password'>Password</Label>
												<div className='relative'>
													<Input
														id='password'
														type={showPassword ? "text" : "password"}
														placeholder='Password'
														{...field}
														className={meta.touched && meta.error ? "border-red-500 pr-10" : "pr-10"}
													/>
													<button type='button' className='absolute right-3 top-1/2 transform -translate-y-1/2' onClick={() => setShowPassword(!showPassword)}>
														{showPassword ? <EyeOffIcon className='h-4 w-4 text-gray-500' /> : <EyeIcon className='h-4 w-4 text-gray-500' />}
													</button>
												</div>
												{meta.touched && meta.error && <p className='text-sm text-red-500'>{meta.error}</p>}
											</div>
										)}
									</FormikField>
								</div>

								<div className='col-span-2'>
									<FormikField name='confirmPassword'>
										{({field, meta}: FieldProps) => (
											<div className='space-y-2'>
												<Label htmlFor='confirmPassword'>Confirm Password</Label>
												<div className='relative'>
													<Input
														id='confirmPassword'
														type={showConfirmPassword ? "text" : "password"}
														placeholder='Confirm Password'
														{...field}
														className={meta.touched && meta.error ? "border-red-500 pr-10" : "pr-10"}
													/>
													<button
														type='button'
														className='absolute right-3 top-1/2 transform -translate-y-1/2'
														onClick={() => setShowConfirmPassword(!showConfirmPassword)}
													>
														{showConfirmPassword ? <EyeOffIcon className='h-4 w-4 text-gray-500' /> : <EyeIcon className='h-4 w-4 text-gray-500' />}
													</button>
												</div>
												{meta.touched && meta.error && <p className='text-sm text-red-500'>{meta.error}</p>}
											</div>
										)}
									</FormikField>
								</div>

								<div className='col-span-2'>
									<Button className='w-full' type='submit' disabled={signupUserMutation.isPending}>
										{signupUserMutation.isPending ? "Signing up..." : "Sign Up"}
									</Button>
								</div>
							</Form>
						</Formik>
					</div>
				</CardContent>
			</Card>
		</AuthLayout>
	);
}

export default Signup;
