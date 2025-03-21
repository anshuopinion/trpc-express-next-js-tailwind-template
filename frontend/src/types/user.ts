export enum UserRole {
	ADMIN = "admin",
	SCHOOL = "school",
	STUDENT = "student",
}

export interface User {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	role: UserRole;
	avatar?: string | null;
}

export interface UserWithToken extends User {
	access_token: string;
	refresh_token: string;
	expires_at: number;
}
