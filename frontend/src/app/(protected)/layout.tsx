"use client";
import React, {useEffect} from "react";
import Sidenav from "@/layout/dashboard-layout/side-nav";
import SideDrawer from "@/layout/dashboard-layout/side-drawer";
import Topnav from "@/layout/dashboard-layout/top-nav";
import useUser from "../../hooks/useUser";
import {useRouter} from "next/navigation";

const DashboardLayout = (props: {children: React.ReactNode}) => {
	const {user} = useUser();
	const router = useRouter();
	const {children} = props;
	const [open, setOpen] = React.useState(false);

	const onOpen = () => setOpen(true);
	const onClose = () => setOpen(false);

	useEffect(() => {
		if (!user) {
			router.replace("/");
		}
	}, [user, router]);

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
