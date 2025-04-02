import {ITodo, TodoModel} from "../model/todo";
import {privateProcedure, router} from "../trpc";
import {z} from "zod";

export const todoRouter = router({
	// Create Crud for todo

	// get all todos
	getAllTodos: privateProcedure.query(async ({ctx}) => {
		const userId = ctx.user?.id;
		const todos = await TodoModel.find({user: userId}).populate("user");

		return todos as unknown as ITodo[];
	}),

	// create todo

	createTodo: privateProcedure
		.input(
			z.object({
				title: z.string().min(1, "Title is required"),
				description: z.string().nullable().optional(),
			})
		)
		.mutation(async ({ctx, input}) => {
			const userId = ctx.user?.id;

			const todo = new TodoModel({
				title: input.title,
				description: input.description,
				user: userId,
			});

			await todo.save();

			return todo as unknown as ITodo;
		}),

	// update todo
	updateTodo: privateProcedure
		.input(
			z.object({
				id: z.string().min(1, "ID is required"),
				title: z.string().min(1, "Title is required"),
				description: z.string().nullable().optional(),
				completed: z.boolean().optional(),
			})
		)
		.mutation(async ({ctx, input}) => {
			const userId = ctx.user?.id;

			const todo = await TodoModel.findOneAndUpdate({_id: input.id, user: userId}, input, {new: true});

			return todo as unknown as ITodo;
		}),

	// delete todo
	deleteTodo: privateProcedure
		.input(
			z.object({
				id: z.string().min(1, "ID is required"),
			})
		)
		.mutation(async ({ctx, input}) => {
			const userId = ctx.user?.id;

			const todo = await TodoModel.findOneAndDelete({_id: input.id, user: userId});

			return todo as unknown as ITodo;
		}),
	// get todo by id
	getTodoById: privateProcedure
		.input(
			z.object({
				id: z.string().min(1, "ID is required"),
			})
		)
		.query(async ({ctx, input}) => {
			const userId = ctx.user?.id;

			const todo = await TodoModel.findOne({_id: input.id, user: userId}).populate("user");

			return todo as unknown as ITodo;
		}),
});
