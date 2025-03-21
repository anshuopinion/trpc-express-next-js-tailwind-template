import React from "react";
import Sidenav from "./side-nav";
import {Drawer, DrawerClose, DrawerContent, DrawerTrigger} from "@/components/ui/drawer";

interface SideDrawerProps {
	open: boolean;
	onClose: () => void;
}

const SideDrawer = (props: SideDrawerProps) => {
	const {open, onClose} = props;

	return (
		<Drawer
			open={open}
			onOpenChange={isOpen => {
				if (!isOpen) onClose();
			}}
		>
			<DrawerContent>
				<div className='p-4'>
					<Sidenav onClose={onClose} isDrawer={true} />
				</div>
				<DrawerClose className='absolute top-4 right-4' onClick={onClose} />
			</DrawerContent>
		</Drawer>
	);
};

export default SideDrawer;
