"use client";
import React, {useEffect} from "react";
import Sidenav from "@/layout/dashboard-layout/side-nav";
import SideDrawer from "@/layout/dashboard-layout/side-drawer";
import Topnav from "@/layout/dashboard-layout/top-nav";
import useUser from "../../hooks/useUser";
import {useRouter, usePathname} from "next/navigation";

// Define role-based route access
const roleRouteAccess = {
	admin: ["/admin", "/school", "/student", "/dashboard"],
	school: ["/school", "/student", "/dashboard"],
	student: ["/student", "/dashboard"],
};

const DashboardLayout = (props: {children: React.ReactNode}) => {
	const {user} = useUser();
	const router = useRouter();
	const pathname = usePathname();
	const {children} = props;
	const [open, setOpen] = React.useState(false);

	const onOpen = () => setOpen(true);
	const onClose = () => setOpen(false);

	useEffect(() => {
		if (!user) {
			router.replace("/");
		} else {
			// Check role-based access
			const userRole = user.role || "student";
			const allowedRoutes = roleRouteAccess[userRole as keyof typeof roleRouteAccess] || [];

			// Check if the current path starts with any allowed route prefix
			const hasAccess = allowedRoutes.some(route => pathname.startsWith(route));

			if (!hasAccess) {
				// Redirect to the first allowed route for their role
				if (allowedRoutes.length > 0) {
					router.replace(allowedRoutes[0]);
				} else {
					// Fallback if no routes are allowed (shouldn't happen)
					router.replace("/");
				}
			}
		}
	}, [user, router, pathname]);

	if (!user) {
		return null;
	}

	return (
		<div className='flex'>
			<div className='hidden lg:flex'>
				<Sidenav />
			</div>
			<SideDrawer open={open} onClose={onClose} />
			<div className='flex-grow'>
				<Topnav title='' onOpen={onOpen} />
				<div className='py-2 px-0 h-[calc(100vh-64px)] max-w-full overflow-x-hidden overflow-y-auto flex flex-col'>{children}</div>
			</div>
		</div>
	);
};

export default DashboardLayout;
