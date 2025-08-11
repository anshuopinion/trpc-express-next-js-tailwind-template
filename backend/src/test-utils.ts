import { type IUser, UserModel, UserRole } from "./model/user";
import { hashPassword } from "./services/password";

interface CreateTestUserOptions {
  email?: string;
  first_name?: string;
  last_name?: string;
  password?: string;
  role?: UserRole;
  is_email_verified?: boolean;
  avatar?: string;
  refresh_token?: string | null;
  verify_token?: string | null;
}

interface CreateTestUserResult {
  user: IUser;
  rawPassword: string;
}

export const createTestUser = async (
  options: CreateTestUserOptions = {}
): Promise<CreateTestUserResult> => {
  const {
    email = `test${Date.now()}@example.com`, // Make email unique
    first_name = "Test",
    last_name = "User",
    password = "TestPassword123!",
    role = UserRole.USER,
    is_email_verified = false,
    avatar,
    refresh_token,
    verify_token,
  } = options;

  // Store raw password for return
  const rawPassword = password;

  // Hash the password
  const hashedPassword = await hashPassword(password);

  // Create user data
  const userData = {
    email,
    first_name,
    last_name,
    password: hashedPassword,
    role,
    is_email_verified,
    avatar,
    refresh_token,
    verify_token,
  };

  // Create user in database
  const user = await UserModel.create(userData);

  return {
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar: user.avatar,
      password: user.password,
      refresh_token: user.refresh_token,
      is_email_verified: user.is_email_verified,
      verify_token: user.verify_token,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    rawPassword,
  };
};

export const generateUserData = (overrides: Partial<CreateTestUserOptions> = {}) => {
  return {
    email: `test${Date.now()}@example.com`,
    first_name: "Test",
    last_name: "User",
    password: "TestPassword123!",
    role: UserRole.USER,
    is_email_verified: false,
    ...overrides,
  };
};
