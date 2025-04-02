import {getModelForClass, modelOptions, prop, Ref} from "@typegoose/typegoose";
import {UserClass} from "./user";

@modelOptions({
	schemaOptions: {
		collection: "todos",
	},
})
export class TodoClass {
	@prop({required: true, type: String})
	public title: string;

	@prop({type: String})
	public description?: string | null;

	@prop({default: false, type: Boolean})
	public completed: boolean;

	@prop({type: Date})
	public created_at?: Date | null;

	@prop({type: Date})
	public updated_at?: Date | null;

	@prop({ref: () => UserClass})
	public user: Ref<UserClass>;
}

export type ITodo = TodoClass & {id: string};
export const TodoModel = getModelForClass(TodoClass);
