import React from "react";
import {FaBars, FaUserTie} from "react-icons/fa";
import useUser from "../../hooks/useUser";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {Avatar, AvatarImage, AvatarFallback} from "@/components/ui/avatar";
import {trpc} from "@/trpc/client";

const Topnav = ({title, onOpen}: {title: string; onOpen: () => void}) => {
	const {logout, user} = useUser();
	const {data: userData, isLoading: isUserLoading} = trpc.user.getProfile.useQuery();

	const getFullName = () => {
		if (!user) return "User";
		return `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User";
	};

	return (
		<div className='px-4 shadow-md z-10 relative'>
			<div className='max-w-[70rem] h-16 flex justify-between items-center mx-auto'>
				<Button variant='ghost' size='icon' onClick={onOpen} className='lg:hidden hover:cursor-pointer'>
					<FaBars className='h-5 w-5' />
				</Button>

				<h1 className='text-2xl font-medium'>{title}</h1>

				<div className='flex items-center gap-4'>
					{/* <ThemeSwitch /> */}

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant='ghost' size='icon' className='rounded-full hover:cursor-pointer hover:bg-secondary'>
								<Avatar>
									{userData?.avatar ? (
										<AvatarImage src={userData.avatar} alt={getFullName()} />
									) : (
										<AvatarFallback>
											<FaUserTie className='h-5 w-5' />
										</AvatarFallback>
									)}
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end' className='w-56'>
							<div className='flex items-center p-3 gap-3'>
								<Avatar className='h-10 w-10 border'>
									{userData?.avatar ? (
										<AvatarImage src={userData.avatar} alt={getFullName()} />
									) : (
										<AvatarFallback>
											<FaUserTie className='h-5 w-5' />
										</AvatarFallback>
									)}
								</Avatar>
								<div className='flex flex-col space-y-0.5'>
									<p className='text-sm font-medium'>{getFullName()}</p>
								</div>
							</div>
							<DropdownMenuSeparator />
							<Link href='/dashboard/profile' className='block'>
								<DropdownMenuItem className='hover:cursor-pointer'>Profile Settings</DropdownMenuItem>
							</Link>
							<DropdownMenuItem className='hover:cursor-pointer'>Support</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={logout} className='text-red-500 focus:text-red-500 hover:cursor-pointer'>
								Logout
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</div>
	);
};

export default Topnav;
