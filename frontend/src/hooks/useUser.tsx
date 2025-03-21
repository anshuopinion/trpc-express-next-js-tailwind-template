"use client";
import {useEffect, useState} from "react";
import {useCookies} from "react-cookie";
import {useRouter} from "next/navigation";
interface IUser {
	access_token: string;
	email: string;
	expires_at: number;
	first_name: string;
	id: string;
	last_name: string;
	refresh_token: string;
	role: string;
}
function useUser() {
	const router = useRouter();
	const [cookies, setCookie, removeCookie] = useCookies(["user"]);
	const [isLogIn, setIsLogIn] = useState<boolean>();
	const user = cookies?.user as IUser;

	const logIn = (user: any) => {
		setCookie("user", user, {path: "/"});
	};

	const logout = () => {
		removeCookie("user");
		setCookie("user", null, {path: "/"});
		router.replace("/");
	};

	useEffect(() => {
		if (user) {
			setIsLogIn(true);
		} else {
			setIsLogIn(false);
		}
	}, [user]);

	return {isLogIn, user, logIn, logout};
}

export default useUser;
