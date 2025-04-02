"use client";
import {trpc} from "@/trpc/client";
import React, {useState} from "react";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {toast} from "sonner";
import {Loader2, MoreVertical, Check, X, Pencil, Trash} from "lucide-react";

const DashboardPage = () => {
	// State for the new todo form
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// State for editing todos
	const [editingTodo, setEditingTodo] = useState<{id: string; title: string; description: string | null} | null>(null);

	// Query to get all todos
	const {data: todos, isLoading, refetch} = trpc.todo.getAllTodos.useQuery();

	// Mutations for CRUD operations
	const createTodoMutation = trpc.todo.createTodo.useMutation({
		onSuccess: () => {
			toast.success("Todo created successfully");
			setTitle("");
			setDescription("");
			setIsSubmitting(false);
			refetch();
		},
		onError: error => {
			toast.error(error.message || "Failed to create todo");
			setIsSubmitting(false);
		},
	});

	const updateTodoMutation = trpc.todo.updateTodo.useMutation({
		onSuccess: () => {
			toast.success("Todo updated successfully");
			setEditingTodo(null);
			refetch();
		},
		onError: error => {
			toast.error(error.message || "Failed to update todo");
		},
	});

	const deleteTodoMutation = trpc.todo.deleteTodo.useMutation({
		onSuccess: () => {
			toast.success("Todo deleted successfully");
			refetch();
		},
		onError: error => {
			toast.error(error.message || "Failed to delete todo");
		},
	});

	// Handle form submission
	const handleCreateTodo = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) {
			toast.error("Title is required");
			return;
		}

		setIsSubmitting(true);
		createTodoMutation.mutate({
			title,
			description: description || null,
		});
	};

	// Handle todo status toggle
	const handleToggleStatus = (id: string, completed: boolean, title: string, description: string | null) => {
		updateTodoMutation.mutate({
			id,
			title,
			description,
			completed: !completed,
		});
	};

	// Handle todo update
	const handleUpdateTodo = (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingTodo || !editingTodo.title.trim()) {
			toast.error("Title is required");
			return;
		}

		updateTodoMutation.mutate({
			id: editingTodo.id,
			title: editingTodo.title,
			description: editingTodo.description,
		});
	};

	// Handle todo deletion
	const handleDeleteTodo = (id: string) => {
		deleteTodoMutation.mutate({id});
	};

	return (
		<div className='container py-6 px-4'>
			<div className='mb-8'>
				<h1 className='text-3xl font-bold mb-2'>Todo Dashboard</h1>
				<p className='text-muted-foreground'>Manage your tasks efficiently</p>
			</div>

			{/* Create Todo Form */}
			<Card className='mb-8'>
				<CardHeader>
					<CardTitle>Create New Todo</CardTitle>
					<CardDescription>Add a new task to your list</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleCreateTodo} className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='title'>Title</Label>
							<Input id='title' placeholder='Enter task title' value={title} onChange={e => setTitle(e.target.value)} disabled={isSubmitting} />
						</div>
						<div className='space-y-2'>
							<Label htmlFor='description'>Description (optional)</Label>
							<Input
								id='description'
								placeholder='Enter task description'
								value={description}
								onChange={e => setDescription(e.target.value)}
								disabled={isSubmitting}
							/>
						</div>
						<Button type='submit' disabled={isSubmitting || !title.trim()}>
							{isSubmitting ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Creating...
								</>
							) : (
								"Create Todo"
							)}
						</Button>
					</form>
				</CardContent>
			</Card>

			{/* Todo List */}
			<Card>
				<CardHeader>
					<CardTitle>My Todos</CardTitle>
					<CardDescription>Manage and track your tasks</CardDescription>
				</CardHeader>
				<CardContent className='p-0'>
					{isLoading ? (
						<div className='flex justify-center items-center py-8'>
							<Loader2 className='h-8 w-8 animate-spin text-primary' />
						</div>
					) : !todos || todos.length === 0 ? (
						<div className='text-center py-8 px-6'>
							<p className='text-muted-foreground'>No todos found. Create your first todo!</p>
						</div>
					) : (
						<div className='divide-y'>
							{todos.map(todo => (
								<div key={todo._id} className={`p-4 transition-all ${todo.completed ? "bg-muted/30" : ""}`}>
									{editingTodo && editingTodo.id === todo._id ? (
										<form onSubmit={handleUpdateTodo} className='space-y-4'>
											<div className='space-y-2'>
												<Label htmlFor={`edit-title-${todo._id}`}>Title</Label>
												<Input
													id={`edit-title-${todo._id}`}
													value={editingTodo.title}
													onChange={e => setEditingTodo({...editingTodo, title: e.target.value})}
												/>
											</div>
											<div className='space-y-2'>
												<Label htmlFor={`edit-description-${todo._id}`}>Description</Label>
												<Input
													id={`edit-description-${todo._id}`}
													value={editingTodo.description || ""}
													onChange={e => setEditingTodo({...editingTodo, description: e.target.value || null})}
												/>
											</div>
											<div className='flex space-x-2'>
												<Button type='submit'>Save</Button>
												<Button type='button' variant='outline' onClick={() => setEditingTodo(null)}>
													Cancel
												</Button>
											</div>
										</form>
									) : (
										<div className='flex items-start justify-between'>
											<div className='flex-1'>
												<h3 className={`font-medium text-lg ${todo.completed ? "line-through text-muted-foreground" : ""}`}>{todo.title}</h3>
												{todo.description && (
													<p className={`mt-1 text-sm ${todo.completed ? "text-muted-foreground/70 line-through" : "text-muted-foreground"}`}>
														{todo.description}
													</p>
												)}
												<div className='mt-2 flex items-center text-xs text-muted-foreground'>
													<span>Created: {new Date(todo.created_at || "").toLocaleDateString()}</span>
												</div>
											</div>
											<div className='flex items-center space-x-2 ml-4'>
												<Button
													variant={todo.completed ? "outline" : "default"}
													size='sm'
													onClick={() => handleToggleStatus(todo._id, todo.completed, todo.title, todo?.description ?? "")}
													className='h-8 w-8 p-0'
												>
													{todo.completed ? <X className='h-4 w-4' /> : <Check className='h-4 w-4' />}
												</Button>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
															<MoreVertical className='h-4 w-4' />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align='end'>
														<DropdownMenuItem
															onClick={() => {
																console.log(todo);
																setEditingTodo({
																	id: todo._id,
																	title: todo.title,
																	description: todo.description || null,
																});
															}}
														>
															<Pencil className='mr-2 h-4 w-4' />
															Edit
														</DropdownMenuItem>
														<DropdownMenuItem className='text-red-600' onClick={() => handleDeleteTodo(todo._id)}>
															<Trash className='mr-2 h-4 w-4' />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</CardContent>
				{todos && todos.length > 0 && (
					<CardFooter className='border-t p-4'>
						<div className='flex justify-between w-full text-sm text-muted-foreground'>
							<span>{todos.length} todo(s)</span>
							<span>{todos.filter(todo => todo.completed).length} completed</span>
						</div>
					</CardFooter>
				)}
			</Card>
		</div>
	);
};

export default DashboardPage;
