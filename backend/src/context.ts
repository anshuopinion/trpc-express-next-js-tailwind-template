import {Request, Response} from "express";
import jwt from "jsonwebtoken";
import {UserRole} from "./model/user";

interface User {
	id: string;
	email: string;
	role: UserRole;
}

export interface Context {
	req: Request;
	res: Response;
	user?: User;
}

export const createContext = async ({req, res}: {req: Request; res: Response}): Promise<Context> => {
	try {
		const token = req.headers.authorization?.split(" ")[1];
		if (token) {
			const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
				userId: string;
				email: string;
				role: UserRole;
			};
			return {
				req,
				res,
				user: {
					id: decoded.userId,
					email: decoded.email,
					role: decoded.role,
				},
			};
		}
		return {req, res};
	} catch (error) {
		return {req, res};
	}
};
