"use client";

import {useState} from "react";
import {trpc} from "@/trpc/client";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Spinner} from "@/components/ui/spinner";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useRouter} from "next/navigation";
import Link from "next/link";

const CATEGORIES = [
	{main: "Programming & Tech", subs: ["Web Development", "Mobile Apps", "Desktop Applications"]},
	{main: "Graphics & Design", subs: ["Logo Design", "Brand Identity", "Illustrations"]},
	{main: "Digital Marketing", subs: ["Social Media", "SEO", "Content Marketing"]},
];

export default function GigsPage() {
	const router = useRouter();
	const [searchParams, setSearchParams] = useState({
		search: "",
		category: "",
		subcategory: "",
		minPrice: "",
		maxPrice: "",
		sortBy: "newest",
	});
	const [cursor, setCursor] = useState<string | undefined>(undefined);

	// Get available subcategories based on selected category
	const subcategories = CATEGORIES.find(c => c.main === searchParams.category)?.subs || [];

	const {
		data: gigsData,
		isLoading,
		isFetching,
		error,
	} = trpc.gigs.getAll.useQuery({
		limit: 12,
		cursor,
		category: searchParams.category || undefined,
		subcategory: searchParams.subcategory || undefined,
		search: searchParams.search || undefined,
		minPrice: searchParams.minPrice ? parseInt(searchParams.minPrice) : undefined,
		maxPrice: searchParams.maxPrice ? parseInt(searchParams.maxPrice) : undefined,
		sortBy: searchParams.sortBy as "newest" | "bestselling" | "topRated",
	});

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchParams(prev => ({...prev, search: e.target.value}));
	};

	const handleCategoryChange = (value: string) => {
		setSearchParams(prev => ({
			...prev,
			category: value,
			subcategory: "", // Reset subcategory when category changes
		}));
	};

	const handleSubcategoryChange = (value: string) => {
		setSearchParams(prev => ({...prev, subcategory: value}));
	};

	const handleSortByChange = (value: string) => {
		setSearchParams(prev => ({...prev, sortBy: value}));
	};

	const handleViewGig = (id: string) => {
		router.push(`/gigs/${id}`);
	};

	if (error) {
		return (
			<div className='container mx-auto py-8'>
				<div className='text-center py-12'>
					<h2 className='text-xl font-semibold text-gray-800'>Error loading gigs</h2>
					<p className='text-gray-600 mt-2'>{error.message}</p>
					<Button className='mt-4' onClick={() => router.refresh()}>
						Try Again
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className='container mx-auto py-8'>
			<div className='flex justify-between items-center mb-6'>
				<h1 className='text-2xl font-bold'>Browse Gigs</h1>
				<Button as={Link} href='/gigs/create'>
					Create New Gig
				</Button>
			</div>

			{/* Filters */}
			<div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
				<Input placeholder='Search gigs...' value={searchParams.search} onChange={handleSearchChange} />

				<Select value={searchParams.category} onValueChange={handleCategoryChange}>
					<SelectTrigger>
						<SelectValue placeholder='All Categories' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value=''>All Categories</SelectItem>
						{CATEGORIES.map(category => (
							<SelectItem key={category.main} value={category.main}>
								{category.main}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select value={searchParams.subcategory} onValueChange={handleSubcategoryChange} disabled={!searchParams.category}>
					<SelectTrigger>
						<SelectValue placeholder='All Subcategories' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value=''>All Subcategories</SelectItem>
						{subcategories.map(sub => (
							<SelectItem key={sub} value={sub}>
								{sub}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select value={searchParams.sortBy} onValueChange={handleSortByChange}>
					<SelectTrigger>
						<SelectValue placeholder='Sort by' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='newest'>Newest</SelectItem>
						<SelectItem value='bestselling'>Best Selling</SelectItem>
						<SelectItem value='topRated'>Top Rated</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Gigs List */}
			{isLoading ? (
				<div className='flex justify-center items-center py-12'>
					<Spinner className='h-8 w-8' />
				</div>
			) : gigsData?.items.length ? (
				<>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{gigsData.items.map(gig => (
							<Card key={gig.id} className='overflow-hidden hover:shadow-md transition-shadow'>
								<CardHeader className='p-0'>
									<div className='h-48 bg-gray-100 flex items-center justify-center'>
										{gig.images && gig.images.length > 0 ? (
											<img src={gig.images[0]} alt={gig.title} className='w-full h-full object-cover' />
										) : (
											<div className='text-gray-400'>No image</div>
										)}
									</div>
								</CardHeader>
								<CardContent className='pt-4'>
									<div className='flex items-center gap-2 mb-2'>
										<div className='h-8 w-8 rounded-full bg-gray-200'>{/* Seller avatar would go here */}</div>
										<span className='text-sm font-medium'>
											{gig.seller?.first_name} {gig.seller?.last_name}
										</span>
									</div>
									<h3 className='font-medium line-clamp-2 mb-2'>{gig.title}</h3>
									<div className='flex items-center gap-1 text-sm text-yellow-500 mb-3'>
										<span>★</span>
										<span>{gig.averageRating || "New"}</span>
									</div>
								</CardContent>
								<CardFooter className='border-t flex justify-between items-center'>
									<Button variant='ghost' size='sm' onClick={() => handleViewGig(gig.id)}>
										View Details
									</Button>
									<div className='text-right'>
										<div className='text-xs text-gray-500'>Starting at</div>
										<div className='font-semibold'>${Math.min(gig.packages.basic.price, gig.packages.standard.price, gig.packages.premium.price)}</div>
									</div>
								</CardFooter>
							</Card>
						))}
					</div>

					{/* Load more button */}
					{gigsData.nextCursor && (
						<div className='flex justify-center mt-8'>
							<Button variant='outline' onClick={() => setCursor(gigsData.nextCursor)} disabled={isFetching}>
								{isFetching ? (
									<>
										<Spinner className='mr-2 h-4 w-4' />
										Loading More...
									</>
								) : (
									"Load More"
								)}
							</Button>
						</div>
					)}
				</>
			) : (
				<div className='text-center py-12'>
					<h2 className='text-xl font-semibold text-gray-800'>No gigs found</h2>
					<p className='text-gray-600 mt-2'>Try adjusting your search filters</p>
				</div>
			)}
		</div>
	);
}
