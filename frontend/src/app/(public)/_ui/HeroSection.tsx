import React from "react";
import Image from "next/image";

const HeroSection = () => {
	return (
		<div className='relative overflow-hidden'>
			<div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
				<div className='flex flex-col lg:flex-row items-center gap-8 md:gap-10 mt-16'>
					{/* Left Content Section */}
					<div className='flex-1 space-y-5 md:space-y-10'>
						<h1 className='font-bold text-3xl sm:text-4xl lg:text-6xl leading-tight'>
							<span className='relative bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>TRPC Template</span>
							<br />
							<span className='text-2xl sm:text-3xl lg:text-5xl'></span>
						</h1>
						<p className='text-lg lg:text-xl max-w-lg'></p>

						<p className='text-sm mt-2'>TRPC template</p>
					</div>

					{/* Right Image Section */}
					<div className='flex-1 flex justify-center items-center relative z-10'>
						<div className='relative h-[300px] md:h-[400px] lg:h-[500px] w-full overflow-hidden'>
							<Image
								alt='Geometric Bull Logo'
								src='/logo.png'
								fill
								className='object-contain scale-110 transition-transform duration-300 ease-in-out hover:scale-115'
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default HeroSection;
