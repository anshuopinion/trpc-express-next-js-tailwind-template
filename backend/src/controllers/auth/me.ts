interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string | null;
  is_email_verified: boolean;
}

export const me = async (user: User) => {
  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    avatar: user.avatar,
    is_email_verified: user.is_email_verified,
  };
};
