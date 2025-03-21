import React from "react";
import {cn} from "@/lib/utils"; // Assuming you have this utility from shadcn

interface AuthLayoutProps {
	children: React.ReactNode;
}

const AuthLayout = ({children}: AuthLayoutProps) => {
	return (
		<div className='flex min-h-screen relative overflow-hidden'>
			{/* Left Section with Image and Text */}
			<div className='flex-1 relative p-16 bg-background hidden lg:block'>
				<div className='max-w-[440px] relative z-10 space-y-4'>
					<h1 className='text-3xl font-bold text-foreground'>Welcome to template</h1>
					<p className='text-lg text-muted-foreground max-w-[400px]'>TRPC express next js tailwind shadcn template</p>
				</div>

				<img src='/logo.png' alt='tRPC Logo' className='w-auto h-[85vh] object-contain absolute -bottom-[5%] left-1/2 -translate-x-1/2 filter drop-shadow-sm' />
			</div>

			{/* Right Section with Auth Form */}
			<div className={cn("flex-1 px-6 py-8 bg-background relative z-10", "md:px-12 md:py-12", "lg:px-24 lg:border-l lg:border-border")}>
				<div className='max-w-[440px] mx-auto w-full mt-8 lg:mt-12'>{children}</div>
			</div>
		</div>
	);
};

export default AuthLayout;
