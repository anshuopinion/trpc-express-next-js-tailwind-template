"use client";
import {trpc} from "@/trpc/client";
import React, {useState, useEffect} from "react";
import {toast} from "sonner";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Formik, Form, Field, ErrorMessage, FormikProps} from "formik";
import * as Yup from "yup";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Loader2} from "lucide-react";

// Define the validation schema using Yup
const ProfileSchema = Yup.object().shape({
	first_name: Yup.string().required("First name is required"),
	last_name: Yup.string().required("Last name is required"),
	avatar: Yup.string().nullable(),
});

interface ProfileFormValues {
	first_name: string;
	last_name: string;
	avatar: string | null;
}

const ProfilePage = () => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [initialValues, setInitialValues] = useState<ProfileFormValues>({
		first_name: "",
		last_name: "",
		avatar: null,
	});

	const {data: userData, isLoading: isUserLoading} = trpc.user.getProfile.useQuery();
	const {mutate: updateProfile} = trpc.user.updateProfile.useMutation({
		onSuccess: () => {
			toast.success("Profile updated successfully!");
			setIsSubmitting(false);
		},
		onError: error => {
			toast.error(error.message || "Failed to update profile");
			setIsSubmitting(false);
		},
	});

	useEffect(() => {
		if (userData) {
			setInitialValues({
				first_name: userData.first_name,
				last_name: userData.last_name,
				avatar: userData.avatar || null,
			});
		}
	}, [userData]);

	const handleSubmit = (values: ProfileFormValues) => {
		setIsSubmitting(true);
		updateProfile({
			first_name: values.first_name,
			last_name: values.last_name,
			avatar: values.avatar,
		});
	};

	if (isUserLoading) {
		return (
			<div className='flex justify-center items-center min-h-[50vh]'>
				<Loader2 className='h-8 w-8 animate-spin text-primary' />
			</div>
		);
	}

	const getInitials = (values: ProfileFormValues) => {
		const firstName = values.first_name || "";
		const lastName = values.last_name || "";
		return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
	};

	return (
		<div className='container py-6  px-4 sm:px-6'>
			<Card className='w-full'>
				<CardHeader>
					<CardTitle className='text-2xl font-bold'>Profile Settings</CardTitle>
					<CardDescription>Update your personal information and profile picture</CardDescription>
				</CardHeader>
				<CardContent>
					<Formik enableReinitialize initialValues={initialValues} validationSchema={ProfileSchema} onSubmit={handleSubmit}>
						{(formikProps: FormikProps<ProfileFormValues>) => (
							<>
								<div className='mb-6 flex flex-col md:flex-row gap-6 items-start md:items-center'>
									<Avatar className='h-24 w-24'>
										<AvatarImage src={formikProps.values.avatar || ""} alt='Profile' />
										<AvatarFallback className='text-lg'>{getInitials(formikProps.values)}</AvatarFallback>
									</Avatar>
									<div>
										<h3 className='text-lg font-medium'>Profile Picture</h3>
										<p className='text-sm text-muted-foreground mb-2'>Add a URL to your profile picture</p>
									</div>
								</div>

								<Form className='space-y-6'>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										<div className='space-y-2'>
											<label htmlFor='first_name' className='text-sm font-medium'>
												First Name
											</label>
											<Field as={Input} id='first_name' name='first_name' placeholder='John' />
											<ErrorMessage name='first_name'>{msg => <p className='text-sm text-red-500'>{msg}</p>}</ErrorMessage>
										</div>

										<div className='space-y-2'>
											<label htmlFor='last_name' className='text-sm font-medium'>
												Last Name
											</label>
											<Field as={Input} id='last_name' name='last_name' placeholder='Doe' />
											<ErrorMessage name='last_name'>{msg => <p className='text-sm text-red-500'>{msg}</p>}</ErrorMessage>
										</div>
									</div>

									<div className='space-y-2'>
										<label htmlFor='avatar' className='text-sm font-medium'>
											Avatar URL
										</label>
										<Field as={Input} id='avatar' name='avatar' placeholder='https://example.com/avatar.jpg' />
										<p className='text-xs text-muted-foreground'>Enter a URL to your profile picture</p>
										<ErrorMessage name='avatar'>{msg => <p className='text-sm text-red-500'>{msg}</p>}</ErrorMessage>
									</div>

									<div className='flex items-center justify-end'>
										<Button type='submit' disabled={isSubmitting || !formikProps.dirty || !formikProps.isValid} className='w-full sm:w-auto'>
											{isSubmitting ? (
												<>
													<Loader2 className='mr-2 h-4 w-4 animate-spin' />
													Saving
												</>
											) : (
												"Save changes"
											)}
										</Button>
									</div>
								</Form>
							</>
						)}
					</Formik>
				</CardContent>
			</Card>
		</div>
	);
};

export default ProfilePage;
