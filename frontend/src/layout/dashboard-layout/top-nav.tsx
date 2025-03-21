import React from "react";
import {FaBars, FaUserTie} from "react-icons/fa";
import useUser from "../../hooks/useUser";
// import { ThemeSwitch } from "@/components/ThemeSwitch";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";

const Topnav = ({title, onOpen}: {title: string; onOpen: () => void}) => {
	const {logout} = useUser();

	return (
		<div className='px-4 shadow-md z-10 relative'>
			<div className='max-w-[70rem] h-16 flex justify-between items-center mx-auto'>
				<Button variant='ghost' size='icon' onClick={onOpen} className='lg:hidden'>
					<FaBars className='h-5 w-5' />
				</Button>

				<h1 className='text-2xl font-medium'>{title}</h1>

				<div className='flex items-center gap-4'>
					{/* <ThemeSwitch /> */}

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant='ghost' size='icon'>
								<FaUserTie className='h-6 w-6' />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							<DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
							<DropdownMenuItem>Support</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</div>
	);
};

export default Topnav;
