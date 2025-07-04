import { getModelForClass, modelOptions, prop, Ref } from "@typegoose/typegoose";
import { UserClass } from "./user";

// Define the category schema as a separate class
class GigCategory {
  @prop({ required: true, type: String })
  public main: string;

  @prop({ required: true, type: String })
  public sub: string;
}

// Define the package schema as a separate class
class GigPackage {
  @prop({ required: true, type: String })
  public title: string;

  @prop({ required: true, type: String })
  public description: string;

  @prop({ required: true, type: Number, min: 5 })
  public price: number;
}

// Define packages container
class GigPackages {
  @prop({ required: true, type: () => GigPackage })
  public basic: GigPackage;

  @prop({ required: true, type: () => GigPackage })
  public standard: GigPackage;

  @prop({ required: true, type: () => GigPackage })
  public premium: GigPackage;
}

@modelOptions({
  schemaOptions: {
    collection: "gigs",
    timestamps: true,
  },
})
export class GigClass {
  @prop({ required: true, type: String })
  public title: string;

  @prop({ required: true, type: () => GigCategory })
  public category: GigCategory;

  @prop({ required: true, type: String })
  public description: string;

  @prop({ type: [String], default: [] })
  public searchTags: string[];

  @prop({ required: true, type: () => GigPackages })
  public packages: GigPackages;

  @prop({ type: [String], default: [] })
  public images: string[];

  @prop({ ref: () => UserClass, required: true, type: String })
  public seller: Ref<UserClass>;

  @prop({ default: "active", enum: ["active", "paused", "denied"], type: String })
  public status: string;

  @prop({ default: 0, type: Number })
  public impressions: number;

  @prop({ default: 0, type: Number })
  public clicks: number;

  @prop({ default: 0, type: Number })
  public orders: number;

  @prop({ default: 0, min: 0, max: 5, type: Number })
  public averageRating: number;
}

export type IGig = GigClass & { id: string };
export const GigModel = getModelForClass(GigClass);
