"use client";

import React from "react";
import {Card} from "@/components/ui/card";
import {ShieldIcon, UserPlus, Settings, Users, Activity} from "lucide-react";
import {trpc} from "@/trpc/client";
import useUser from "@/hooks/useUser";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Skeleton} from "@/components/ui/skeleton";

const AdminPage = () => {
	const {user} = useUser();
	const {data: allUsers, isLoading} = trpc.user.getAllUsers.useQuery();

	// Calculate statistics
	const totalUsers = allUsers?.length || 0;
	const totalAdmins = allUsers?.filter(user => user.role === "admin").length || 0;
	const totalSchools = allUsers?.filter(user => user.role === "school").length || 0;
	const totalStudents = allUsers?.filter(user => user.role === "student").length || 0;

	if (!user || user.role !== "admin") {
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
				<ShieldIcon className='h-6 w-6 text-red-500' />
				<h1 className='text-2xl font-bold'>Admin Dashboard</h1>
			</div>

			{/* Statistics Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
				<Card className='p-4 flex items-center gap-4'>
					<div className='bg-purple-100 p-3 rounded-full'>
						<Users className='h-6 w-6 text-purple-600' />
					</div>
					<div>
						<p className='text-sm text-muted-foreground'>Total Users</p>
						{isLoading ? <Skeleton className='h-8 w-16' /> : <p className='text-2xl font-bold'>{totalUsers}</p>}
					</div>
				</Card>

				<Card className='p-4 flex items-center gap-4'>
					<div className='bg-red-100 p-3 rounded-full'>
						<ShieldIcon className='h-6 w-6 text-red-600' />
					</div>
					<div>
						<p className='text-sm text-muted-foreground'>Admins</p>
						{isLoading ? <Skeleton className='h-8 w-16' /> : <p className='text-2xl font-bold'>{totalAdmins}</p>}
					</div>
				</Card>

				<Card className='p-4 flex items-center gap-4'>
					<div className='bg-blue-100 p-3 rounded-full'>
						<UserPlus className='h-6 w-6 text-blue-600' />
					</div>
					<div>
						<p className='text-sm text-muted-foreground'>Schools</p>
						{isLoading ? <Skeleton className='h-8 w-16' /> : <p className='text-2xl font-bold'>{totalSchools}</p>}
					</div>
				</Card>

				<Card className='p-4 flex items-center gap-4'>
					<div className='bg-green-100 p-3 rounded-full'>
						<Activity className='h-6 w-6 text-green-600' />
					</div>
					<div>
						<p className='text-sm text-muted-foreground'>Students</p>
						{isLoading ? <Skeleton className='h-8 w-16' /> : <p className='text-2xl font-bold'>{totalStudents}</p>}
					</div>
				</Card>
			</div>

			{/* Admin Tabs */}
			<Tabs defaultValue='users' className='w-full'>
				<TabsList className='mb-4'>
					<TabsTrigger value='users'>Users Management</TabsTrigger>
					<TabsTrigger value='settings'>System Settings</TabsTrigger>
					<TabsTrigger value='activity'>Activity Logs</TabsTrigger>
				</TabsList>

				<TabsContent value='users' className='space-y-4'>
					<Card className='p-6'>
						<h2 className='text-xl font-semibold mb-4'>User Management</h2>
						<p className='text-muted-foreground mb-4'>
							As an admin, you have full access to manage all users in the system. You can create new users, edit existing ones, or update roles from here.
						</p>

						{isLoading ? (
							<div className='space-y-3'>
								{[...Array(5)].map((_, i) => (
									<div key={i} className='flex items-center space-x-4'>
										<Skeleton className='h-12 w-12 rounded-full' />
										<div className='space-y-2'>
											<Skeleton className='h-4 w-[250px]' />
											<Skeleton className='h-4 w-[200px]' />
										</div>
									</div>
								))}
							</div>
						) : (
							<div className='overflow-x-auto'>
								<table className='w-full'>
									<thead>
										<tr className='border-b'>
											<th className='text-left p-2'>Name</th>
											<th className='text-left p-2'>Email</th>
											<th className='text-left p-2'>Role</th>
										</tr>
									</thead>
									<tbody>
										{allUsers?.map(user => (
											<tr key={user.id} className='border-b'>
												<td className='p-2'>
													{user.first_name} {user.last_name}
												</td>
												<td className='p-2'>{user.email}</td>
												<td className='p-2'>
													<span
														className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                          ${
														user.role === "admin"
															? "bg-red-100 text-red-800"
															: user.role === "school"
															? "bg-blue-100 text-blue-800"
															: "bg-green-100 text-green-800"
													}`}
													>
														{user.role}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</Card>
				</TabsContent>

				<TabsContent value='settings'>
					<Card className='p-6'>
						<h2 className='text-xl font-semibold mb-4'>System Settings</h2>
						<p className='text-muted-foreground'>
							Configure system-wide settings, permissions, and other administrative options. This section will be implemented in a future update.
						</p>
					</Card>
				</TabsContent>

				<TabsContent value='activity'>
					<Card className='p-6'>
						<h2 className='text-xl font-semibold mb-4'>Activity Logs</h2>
						<p className='text-muted-foreground'>
							Review system activity logs, user login history, and other important events. This section will be implemented in a future update.
						</p>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default AdminPage;
