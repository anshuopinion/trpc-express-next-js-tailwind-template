"use client";
import React from "react";
import {FaBars} from "react-icons/fa";
import {AiOutlineClose} from "react-icons/ai";
import useUser from "../../hooks/useUser";
import {Button} from "@/components/ui/button";
import {WEB_APP} from "@/constant/env";
import Link from "next/link";

const Navigation = () => {
	const [open, setOpen] = React.useState(false);
	const toggleOpen = () => setOpen(!open);
	const {isLogIn} = useUser();

	const links = [] as {name: string; url: string; isActive: boolean}[];

	return (
		<div className='sticky top-0 z-40 w-full border-b border-border bg-background shadow-sm '>
			{/* Desktop Navigation */}
			<div className='container mx-auto hidden md:block'>
				<div className='flex h-16 items-center justify-between'>
					<Link href='/' className='text-2xl font-bold text-foreground'>
						{WEB_APP}
					</Link>
					<div className='flex items-center gap-4'>
						<div className='flex items-center gap-4'>
							{links?.map(link => (
								<Link key={link.name} href={link.url} className={`text-lg font-medium ${link.isActive ? "text-primary" : "text-foreground"}`}>
									{link.name}
								</Link>
							))}
						</div>

						<div className='flex items-center gap-2'>
							{/* <ThemeSwitch /> */}
							{isLogIn ? (
								<Link href='/dashboard'>
									<Button>Dashboard</Button>
								</Link>
							) : (
								<>
									<Link href='/signin'>
										<Button variant='outline'>Sign In</Button>
									</Link>
									<Link href='/signup'>
										<Button>Sign Up</Button>
									</Link>
								</>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Mobile Navigation */}
			<div className='container mx-auto md:hidden'>
				<div className='flex h-14 items-center justify-between'>
					<Link href='/' className='text-xl font-bold text-foreground'>
						{WEB_APP}
					</Link>

					<Button variant='ghost' size='icon' onClick={toggleOpen} aria-label='Toggle menu'>
						{!open ? <FaBars className='h-5 w-5' /> : <AiOutlineClose className='h-5 w-5' />}
					</Button>
				</div>

				<div>
					{open && (
						<div className='flex flex-col gap-4 py-4'>
							<div className='flex flex-col gap-4'>
								{links.map((link, index) => (
									<Link
										key={index}
										href={link.url}
										className={`text-lg font-medium ${link.isActive ? "text-primary underline" : "text-foreground no-underline"}`}
									>
										{link.name}
									</Link>
								))}
							</div>

							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-2'>
									{isLogIn ? (
										<Link href='/dashboard'>
											<Button onClick={toggleOpen}>Dashboard</Button>
										</Link>
									) : (
										<>
											<Link href='/signin'>
												<Button variant='outline' onClick={toggleOpen}>
													Sign In
												</Button>
											</Link>
											<Link href='/signup'>
												<Button onClick={toggleOpen}>Sign Up</Button>
											</Link>
										</>
									)}
								</div>
								{/* <ThemeSwitch /> */}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Navigation;
