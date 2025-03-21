"use client";

import React, {useState} from "react";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {School, UserPlus, Users, AlertCircle, Search} from "lucide-react";
import {trpc} from "@/trpc/client";
import {toast} from "sonner";
import useUser from "@/hooks/useUser";
import * as z from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

const formSchema = z.object({
	first_name: z.string().min(1, "First name is required"),
	last_name: z.string().min(1, "Last name is required"),
	email: z.string().email("Please enter a valid email"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

const SchoolPage = () => {
	const {user} = useUser();
	const {data: students, isLoading} = trpc.school.getStudents.useQuery(undefined, {
		enabled: user?.role === "school" || user?.role === "admin",
	});
	const [open, setOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			first_name: "",
			last_name: "",
			email: "",
			password: "",
		},
	});

	const addStudentMutation = trpc.school.addStudent.useMutation({
		onSuccess: () => {
			toast.success("Student added successfully");
			setOpen(false);
			form.reset();
			utils.school.getStudents.invalidate();
		},
		onError: error => {
			toast.error("Failed to add student", {
				description: error.message,
			});
		},
	});

	const utils = trpc.useContext();

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		addStudentMutation.mutate(values);
	};

	// Filter students based on search term
	const filteredStudents = students?.filter(student =>
		`${student.first_name} ${student.last_name} ${student.email}`.toLowerCase().includes(searchTerm.toLowerCase())
	);

	if (!user || (user.role !== "school" && user.role !== "admin")) {
		return (
			<div className='p-6'>
				<h1 className='text-2xl font-bold mb-6'>Access Denied</h1>
				<p>You do not have permission to view this page.</p>
			</div>
		);
	}

	return (
		<div className='p-6'>
			<div className='flex items-center gap-3 mb-6'>
				<School className='h-6 w-6 text-blue-500' />
				<h1 className='text-2xl font-bold'>School Management</h1>
			</div>

			<Tabs defaultValue='students' className='w-full'>
				<TabsList className='mb-4'>
					<TabsTrigger value='students'>Students</TabsTrigger>
					<TabsTrigger value='classes'>Classes</TabsTrigger>
				</TabsList>

				<TabsContent value='students'>
					<Card className='p-6'>
						<div className='flex flex-wrap items-center justify-between gap-4 mb-6'>
							<h2 className='text-xl font-semibold'>Student Management</h2>
							<div className='flex items-center gap-3'>
								<div className='relative'>
									<Search className='absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
									<Input placeholder='Search students...' className='pl-8' value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
								</div>

								<Dialog open={open} onOpenChange={setOpen}>
									<DialogTrigger asChild>
										<Button>
											<UserPlus className='mr-2 h-4 w-4' />
											Add Student
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Add New Student</DialogTitle>
										</DialogHeader>
										<Form {...form}>
											<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
												<div className='grid grid-cols-2 gap-4'>
													<FormField
														control={form.control}
														name='first_name'
														render={({field}) => (
															<FormItem>
																<FormLabel>First Name</FormLabel>
																<FormControl>
																	<Input placeholder='John' {...field} />
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
																	<Input placeholder='Doe' {...field} />
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
																<Input type='email' placeholder='student@example.com' {...field} />
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
																<Input type='password' placeholder='••••••' {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>

												<Button type='submit' className='w-full' disabled={addStudentMutation.isPending}>
													{addStudentMutation.isPending ? "Adding..." : "Add Student"}
												</Button>
											</form>
										</Form>
									</DialogContent>
								</Dialog>
							</div>
						</div>

						{isLoading ? (
							<div className='text-center p-8'>Loading students...</div>
						) : filteredStudents && filteredStudents.length > 0 ? (
							<div className='overflow-x-auto'>
								<table className='w-full'>
									<thead>
										<tr className='border-b'>
											<th className='text-left p-2'>Name</th>
											<th className='text-left p-2'>Email</th>
											<th className='text-left p-2'>Actions</th>
										</tr>
									</thead>
									<tbody>
										{filteredStudents.map(student => (
											<tr key={student.id} className='border-b'>
												<td className='p-2'>
													{student.first_name} {student.last_name}
												</td>
												<td className='p-2'>{student.email}</td>
												<td className='p-2'>
													<Button variant='outline' size='sm'>
														View Details
													</Button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						) : (
							<div className='text-center py-8 flex flex-col items-center'>
								<div className='bg-blue-50 p-3 rounded-full mb-2'>
									<Users className='h-6 w-6 text-blue-500' />
								</div>
								<h3 className='font-medium mb-1'>No students found</h3>
								<p className='text-sm text-muted-foreground mb-4'>
									{searchTerm ? "No students match your search criteria." : "Start by adding your first student."}
								</p>
								{!searchTerm && (
									<DialogTrigger asChild>
										<Button>
											<UserPlus className='mr-2 h-4 w-4' />
											Add Student
										</Button>
									</DialogTrigger>
								)}
							</div>
						)}
					</Card>
				</TabsContent>

				<TabsContent value='classes'>
					<Card className='p-6'>
						<div className='flex items-center gap-3 mb-6 text-amber-500'>
							<AlertCircle className='h-5 w-5' />
							<h2 className='text-lg font-medium'>Coming Soon</h2>
						</div>
						<p className='text-muted-foreground'>
							Class management features will be available in a future update. Check back later for the ability to create and manage classes, assign students,
							and track progress.
						</p>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default SchoolPage;
