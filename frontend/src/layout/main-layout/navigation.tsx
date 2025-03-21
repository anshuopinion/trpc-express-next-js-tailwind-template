"use client";
import React, {useEffect} from "react";
import {FaBars} from "react-icons/fa";
import {AiOutlineClose} from "react-icons/ai";
import useUser from "../../hooks/useUser";
import {Button} from "@/components/ui/button";
import {WEB_APP} from "@/constant/env";
import Link from "next/link";
import {Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger} from "@/components/ui/drawer";

const Navigation = () => {
	const [open, setOpen] = React.useState(false);
	const {isLogIn} = useUser();

	// Close drawer when pressing escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};

		if (open) {
			document.addEventListener("keydown", handleEscape);
			// Prevent scrolling when drawer is open
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "unset";
		};
	}, [open]);

	const links = [] as {name: string; url: string; isActive: boolean}[];

	return (
		<div className='sticky top-0 z-40 w-full border-b border-border backdrop-blur-md bg-background/95 shadow-sm transition-all duration-200'>
			{/* Desktop Navigation */}
			<div className='container mx-auto hidden md:block'>
				<div className='flex h-16 items-center justify-between px-4'>
					<Link href='/' className='text-2xl font-bold text-foreground hover:text-primary transition-colors duration-200'>
						{WEB_APP}
					</Link>
					<div className='flex items-center gap-6'>
						<div className='flex items-center gap-6'>
							{links?.map(link => (
								<Link
									key={link.name}
									href={link.url}
									className={`text-lg font-medium transition-colors duration-200 hover:text-primary ${link.isActive ? "text-primary" : "text-foreground"}`}
								>
									{link.name}
								</Link>
							))}
						</div>

						<div className='flex items-center gap-3'>
							{/* <ThemeSwitch /> */}
							{isLogIn ? (
								<Link href='/dashboard'>
									<Button className='px-5 py-2 transition-all duration-200 hover:scale-105'>Dashboard</Button>
								</Link>
							) : (
								<>
									<Link href='/signin'>
										<Button variant='outline' className='px-5 transition-all duration-200 hover:bg-secondary'>
											Sign In
										</Button>
									</Link>
									<Link href='/signup'>
										<Button className='px-5 py-2 transition-all duration-200 hover:scale-105'>Sign Up</Button>
									</Link>
								</>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Mobile Navigation */}
			<div className='container mx-auto md:hidden'>
				<div className='flex h-16 items-center justify-between px-4'>
					<Link href='/' className='text-xl font-bold text-foreground hover:text-primary transition-colors duration-200'>
						{WEB_APP}
					</Link>

					<Drawer open={open} onOpenChange={setOpen} direction='left'>
						<DrawerTrigger asChild>
							<Button variant='ghost' size='icon' aria-label='Toggle menu' className='hover:bg-secondary/50 h-10 w-10'>
								<FaBars className='h-5 w-5' />
							</Button>
						</DrawerTrigger>
						<DrawerContent className='h-full w-[280px] max-w-[80vw] flex flex-col left-0'>
							<DrawerHeader className='border-b'>
								<div className='flex justify-between items-center'>
									<DrawerTitle className='text-lg font-semibold'>{WEB_APP}</DrawerTitle>
									<DrawerClose asChild>
										<Button variant='ghost' size='icon' className='h-9 w-9'>
											<AiOutlineClose className='h-5 w-5' />
										</Button>
									</DrawerClose>
								</div>
							</DrawerHeader>

							<div className='flex flex-col p-5 flex-1 overflow-y-auto'>
								{/* Navigation Links */}
								<div className='flex flex-col gap-3 mb-6'>
									{links.length > 0 ? (
										links.map((link, index) => (
											<Link
												key={index}
												href={link.url}
												className={`py-3 text-lg font-medium transition-colors hover:text-primary ${link.isActive ? "text-primary" : "text-foreground"}`}
												onClick={() => setOpen(false)}
											>
												{link.name}
											</Link>
										))
									) : (
										<div className='text-muted-foreground py-2'>No navigation links</div>
									)}
								</div>
							</div>

							<DrawerFooter className='mt-auto border-t pt-5'>
								{isLogIn ? (
									<Link href='/dashboard' className='block w-full mb-4' onClick={() => setOpen(false)}>
										<Button className='w-full h-12'>Dashboard</Button>
									</Link>
								) : (
									<div className='flex flex-col gap-3'>
										<Link href='/signin' className='block w-full' onClick={() => setOpen(false)}>
											<Button variant='outline' className='w-full h-12'>
												Sign In
											</Button>
										</Link>
										<Link href='/signup' className='block w-full' onClick={() => setOpen(false)}>
											<Button className='w-full h-12'>Sign Up</Button>
										</Link>
									</div>
								)}
								{/* <div className="mt-4 flex justify-center">
									<ThemeSwitch />
								</div> */}
							</DrawerFooter>
						</DrawerContent>
					</Drawer>
				</div>
			</div>
		</div>
	);
};

export default Navigation;
