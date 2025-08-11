import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

@modelOptions({
  schemaOptions: {
    collection: "users",
    timestamps: true,
  },
})
export class UserClass {
  @prop({ required: true, type: String })
  public first_name: string;

  @prop({ required: true, type: String })
  public last_name: string;

  @prop({ type: String })
  public avatar?: string | null;

  @prop({ required: true, unique: true, type: String })
  public email: string;

  @prop({ required: true, type: String })
  public password: string;

  @prop({ type: String })
  public refresh_token?: string | null;

  @prop({ default: false, type: Boolean })
  public is_email_verified: boolean;

  @prop({ type: String })
  public verify_token?: string | null;

  @prop({
    required: true,
    enum: UserRole,
    default: UserRole.USER,
    type: String,
    index: true,
  })
  public role: UserRole;

  // Timestamps (automatically managed by Mongoose when timestamps: true)
  public createdAt?: Date;
  public updatedAt?: Date;
}

export type IUser = UserClass & { id: string };
export const UserModel = getModelForClass(UserClass);
