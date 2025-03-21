import {z} from "zod";
import {schoolProcedure, router} from "../trpc";
import {UserModel, UserRole} from "../model/user";

export const schoolRouter = router({
	getStudents: schoolProcedure.query(async () => {
		const students = await UserModel.find({role: UserRole.STUDENT});
		return students.map(student => ({
			id: student._id.toString(),
			first_name: student.first_name,
			last_name: student.last_name,
			email: student.email,
		}));
	}),

	addStudent: schoolProcedure
		.input(
			z.object({
				email: z.string().email(),
				first_name: z.string().min(1),
				last_name: z.string().min(1),
				password: z.string().min(6),
			})
		)
		.mutation(async ({input}) => {
			const {email, first_name, last_name, password} = input;

			const existingUser = await UserModel.findOne({email});
			if (existingUser) {
				throw new Error("User already exists");
			}

			const hashedPassword = await bcrypt.hash(password, 10);

			const student = await UserModel.create({
				email,
				first_name,
				last_name,
				password: hashedPassword,
				role: UserRole.STUDENT,
			});

			return {
				success: true,
				student: {
					id: student._id.toString(),
					email: student.email,
					first_name: student.first_name,
					last_name: student.last_name,
				},
			};
		}),
});

import bcrypt from "bcryptjs";
