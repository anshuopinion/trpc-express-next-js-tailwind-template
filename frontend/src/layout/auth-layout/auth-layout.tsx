import React from "react";
import {cn} from "@/lib/utils"; // Assuming you have this utility from shadcn
import {motion} from "framer-motion"; // You might need to install framer-motion

interface AuthLayoutProps {
	children: React.ReactNode;
}

const AuthLayout = ({children}: AuthLayoutProps) => {
	return (
		<div className='flex min-h-screen relative overflow-hidden bg-muted/5'>
			{/* Subtle background pattern */}
			<div className='absolute inset-0 bg-grid-slate-200/50 ' />

			{/* Left Section with Image and Text */}
			<motion.div
				initial={{opacity: 0, x: -20}}
				animate={{opacity: 1, x: 0}}
				transition={{duration: 0.5}}
				className='flex-1 relative px-16 py-8 bg-background hidden lg:flex flex-col  gap-4'
			>
				<div className='max-w-[440px] relative z-10 '>
					<div className='h-8 w-8 rounded-full bg-primary flex mb-2 items-center justify-center'>
						<span className='text-primary-foreground font-bold'>T</span>
					</div>
					<h1 className='text-4xl font-bold text-foreground'>Welcome to our platform</h1>
					<p className='text-lg text-muted-foreground max-w-[400px]'>
						A comprehensive tRPC + Express + Next.js template with Tailwind CSS and shadcn/ui components.
					</p>
				</div>

				<div className='relative z-10 flex  items-center'>
					<figure className='w-full opacity-90 max-w-[500px]'>
						<video autoPlay loop muted playsInline className='rounded-lg border-2 border-border shadow-xl'>
							<source src='https://assets.trpc.io/www/v10/preview-dark.mp4' type='video/mp4' />
							Your browser does not support HTML5 video.
						</video>
					</figure>
				</div>

				<div className='relative z-10 text-sm text-muted-foreground'>&copy; {new Date().getFullYear()} Template Project. All rights reserved.</div>
			</motion.div>

			{/* Right Section with Auth Form */}
			<motion.div
				initial={{opacity: 0, x: 20}}
				animate={{opacity: 1, x: 0}}
				transition={{duration: 0.5, delay: 0.2}}
				className={cn("flex-1 px-6 py-8 bg-background relative z-10", "md:px-12 md:py-12", "lg:px-24 lg:border-l lg:border-border")}
			>
				<div className='max-w-[440px] mx-auto w-full  '>
					<div className='mb-6 hidden md:block'>
						<h2 className='text-2xl font-bold tracking-tight'>Authentication</h2>
						<p className='text-muted-foreground mt-1'>Enter your credentials to access your account</p>
					</div>
					{children}
				</div>

				<div className='mt-8 text-center text-sm text-muted-foreground lg:hidden'>&copy; {new Date().getFullYear()} Template Project. All rights reserved.</div>
			</motion.div>
		</div>
	);
};

export default AuthLayout;
