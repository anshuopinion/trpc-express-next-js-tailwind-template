"use client";

import React, {useState} from "react";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Label} from "@/components/ui/label";
import {Loader2, ShieldIcon, UserIcon, School} from "lucide-react";
import {trpc} from "@/trpc/client";
import {toast} from "sonner";
import useUser from "@/hooks/useUser";
import {UserRole} from "@/types/user";

const DashboardPage = () => {
	const {user} = useUser();
	const utils = trpc.useUtils();

	// Only admins can fetch all users
	const {data: allUsers, isLoading: isLoadingUsers} = trpc.user.getAllUsers.useQuery(undefined, {enabled: user?.role === "admin"});

	const [selectedUserId, setSelectedUserId] = useState<string>("");
	const [selectedRole, setSelectedRole] = useState<string>("");

	const updateRoleMutation = trpc.user.updateUserRole.useMutation({
		onSuccess: () => {
			toast.success("User role updated successfully");
			utils.user.getAllUsers.invalidate();
			setSelectedUserId("");
			setSelectedRole("");
		},
		onError: error => {
			toast.error("Failed to update role", {
				description: error.message,
			});
		},
	});

	// Role display component for all users
	const RoleDisplay = () => {
		return (
			<Card className='p-6 mb-6'>
				<div className='flex items-center gap-3 mb-4'>
					{user?.role === "admin" ? (
						<ShieldIcon className='h-6 w-6 text-red-500' />
					) : user?.role === "school" ? (
						<School className='h-6 w-6 text-blue-500' />
					) : (
						<UserIcon className='h-6 w-6 text-green-500' />
					)}
					<div>
						<h2 className='text-xl font-semibold'>Your Account</h2>
						<p className='text-muted-foreground'>
							{user?.first_name} {user?.last_name}
							<span className='inline-flex items-center ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>{user?.role}</span>
						</p>
					</div>
				</div>
				<p className='text-sm text-muted-foreground mb-3'>
					You have {user?.role} privileges in the system.
					{user?.role === "admin" && " You can manage all users and their roles."}
					{user?.role === "school" && " You can manage students."}
					{user?.role === "student" && " You have access to student resources."}
				</p>
			</Card>
		);
	};

	// Admin-only role management component
	const AdminRoleManager = () => {
		if (user?.role !== "admin") return null;

		return (
			<Card className='p-6 mt-4'>
				<h2 className='text-xl font-semibold mb-4'>Manage User Roles</h2>

				{isLoadingUsers ? (
					<div className='flex justify-center'>
						<Loader2 className='h-6 w-6 animate-spin' />
					</div>
				) : (
					<div className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='user-select'>Select User</Label>
							<Select value={selectedUserId} onValueChange={setSelectedUserId}>
								<SelectTrigger>
									<SelectValue placeholder='Select a user' />
								</SelectTrigger>
								<SelectContent>
									{allUsers?.map(user => (
										<SelectItem key={user.id} value={user.id}>
											{user.first_name} {user.last_name} ({user.email}) - {user.role}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{selectedUserId && (
							<div className='space-y-2'>
								<Label htmlFor='role-select'>Assign Role</Label>
								<Select value={selectedRole} onValueChange={setSelectedRole}>
									<SelectTrigger>
										<SelectValue placeholder='Select a role' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='admin'>Admin</SelectItem>
										<SelectItem value='school'>School</SelectItem>
										<SelectItem value='student'>Student</SelectItem>
									</SelectContent>
								</Select>

								<Button
									className='w-full mt-4'
									disabled={!selectedRole || updateRoleMutation.isPending}
									onClick={() => {
										updateRoleMutation.mutate({
											userId: selectedUserId,
											role: selectedRole as UserRole,
										});
									}}
								>
									{updateRoleMutation.isPending ? (
										<>
											<Loader2 className='mr-2 h-4 w-4 animate-spin' />
											Updating...
										</>
									) : (
										"Update Role"
									)}
								</Button>
							</div>
						)}
					</div>
				)}

				{allUsers && allUsers.length > 0 && (
					<div className='mt-6'>
						<h3 className='font-medium mb-2'>Current Users:</h3>
						<div className='overflow-x-auto'>
							<table className='w-full text-sm'>
								<thead>
									<tr className='bg-gray-100 text-left'>
										<th className='p-2'>Name</th>
										<th className='p-2'>Email</th>
										<th className='p-2'>Role</th>
									</tr>
								</thead>
								<tbody>
									{allUsers.map(user => (
										<tr key={user.id} className='border-b hover:bg-gray-50'>
											<td className='p-2'>
												{user.first_name} {user.last_name}
											</td>
											<td className='p-2'>{user.email}</td>
											<td className='p-2'>
												<span
													className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
													${user.role === "admin" ? "bg-red-100 text-red-800" : user.role === "school" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
												>
													{user.role}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</Card>
		);
	};

	return (
		<div className='p-6'>
			<h1 className='text-2xl font-bold mb-6'>Dashboard</h1>
			<RoleDisplay />
			<AdminRoleManager />
		</div>
	);
};

export default DashboardPage;
