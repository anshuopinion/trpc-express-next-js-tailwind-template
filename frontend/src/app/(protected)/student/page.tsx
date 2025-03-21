"use client";

import React from "react";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {UserIcon, BookOpen, GraduationCap, Calendar, Clock} from "lucide-react";
import useUser from "@/hooks/useUser";
import {Progress} from "@/components/ui/progress";

const StudentPage = () => {
	const {user} = useUser();

	// Sample data - in a real app, this would come from your API
	const courses = [
		{
			id: 1,
			title: "Introduction to Mathematics",
			progress: 75,
			nextLesson: "Algebra Basics",
			nextLessonDate: "Tomorrow, 10:00 AM",
		},
		{
			id: 2,
			title: "English Literature",
			progress: 30,
			nextLesson: "Shakespeare's Sonnets",
			nextLessonDate: "Thursday, 2:00 PM",
		},
		{
			id: 3,
			title: "Basic Sciences",
			progress: 50,
			nextLesson: "Introduction to Chemistry",
			nextLessonDate: "Friday, 11:30 AM",
		},
	];

	// Upcoming events
	const events = [
		{
			id: 1,
			title: "Math Quiz",
			date: "June 15, 2023",
			time: "10:00 AM",
		},
		{
			id: 2,
			title: "Literature Essay Submission",
			date: "June 18, 2023",
			time: "11:59 PM",
		},
		{
			id: 3,
			title: "Science Lab Session",
			date: "June 20, 2023",
			time: "2:30 PM",
		},
	];

	if (!user) {
		return (
			<div className='p-6'>
				<h1 className='text-2xl font-bold mb-6'>Loading...</h1>
			</div>
		);
	}

	return (
		<div className='p-6'>
			<div className='flex items-center gap-3 mb-6'>
				<UserIcon className='h-6 w-6 text-green-500' />
				<h1 className='text-2xl font-bold'>Student Dashboard</h1>
			</div>

			{/* Welcome message */}
			<Card className='p-6 mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-100'>
				<div className='flex items-center gap-4 mb-3'>
					<div className='bg-green-100 p-3 rounded-full'>
						<GraduationCap className='h-6 w-6 text-green-600' />
					</div>
					<div>
						<h2 className='text-xl font-semibold'>Welcome, {user.first_name}!</h2>
						<p className='text-sm text-muted-foreground'>Here&apos;s an overview of your academic journey</p>
					</div>
				</div>
			</Card>

			{/* Main content */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Courses section - takes up 2 columns */}
				<div className='lg:col-span-2 space-y-6'>
					<h2 className='text-lg font-semibold flex items-center gap-2'>
						<BookOpen className='h-5 w-5 text-blue-500' />
						My Courses
					</h2>

					{courses.map(course => (
						<Card key={course.id} className='p-6'>
							<div className='flex justify-between items-start mb-4'>
								<h3 className='font-semibold'>{course.title}</h3>
								<Button size='sm' variant='outline'>
									View Course
								</Button>
							</div>

							<div className='space-y-2'>
								<div className='flex justify-between text-sm'>
									<span>Progress</span>
									<span className='font-medium'>{course.progress}%</span>
								</div>
								<Progress value={course.progress} className='h-2' />
							</div>

							<div className='mt-4 pt-4 border-t border-gray-100'>
								<p className='text-sm text-muted-foreground'>Next lesson:</p>
								<div className='flex justify-between items-center mt-1'>
									<p className='font-medium'>{course.nextLesson}</p>
									<p className='text-sm text-muted-foreground'>{course.nextLessonDate}</p>
								</div>
							</div>
						</Card>
					))}

					<div className='text-center'>
						<Button variant='outline'>View All Courses</Button>
					</div>
				</div>

				{/* Sidebar - takes up 1 column */}
				<div className='space-y-6'>
					{/* Calendar & Events */}
					<Card className='p-6'>
						<h3 className='font-semibold mb-4 flex items-center gap-2'>
							<Calendar className='h-4 w-4 text-red-500' />
							Upcoming Events
						</h3>

						<div className='space-y-4'>
							{events.map(event => (
								<div key={event.id} className='flex gap-4 items-start pb-3 border-b last:border-0 last:pb-0'>
									<div className='bg-red-50 rounded-md p-2 flex flex-col items-center justify-center min-w-[50px]'>
										<span className='text-xs text-red-500'>{event.date.split(",")[0]}</span>
										<span className='font-bold text-red-600'>{event.date.split(" ")[1]}</span>
									</div>
									<div>
										<p className='font-medium'>{event.title}</p>
										<div className='flex items-center gap-1 mt-1 text-xs text-muted-foreground'>
											<Clock className='h-3 w-3' />
											<span>{event.time}</span>
										</div>
									</div>
								</div>
							))}
						</div>

						<Button variant='ghost' className='w-full mt-4 text-sm'>
							View Full Calendar
						</Button>
					</Card>

					{/* Resources */}
					<Card className='p-6'>
						<h3 className='font-semibold mb-4'>Quick Links</h3>
						<div className='space-y-2'>
							<Button variant='ghost' className='w-full justify-start'>
								<BookOpen className='mr-2 h-4 w-4' />
								Library Resources
							</Button>
							<Button variant='ghost' className='w-full justify-start'>
								<Clock className='mr-2 h-4 w-4' />
								Schedule a Tutor
							</Button>
							<Button variant='ghost' className='w-full justify-start'>
								<Calendar className='mr-2 h-4 w-4' />
								Academic Calendar
							</Button>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default StudentPage;
