export type Workspace = {
  id: string;
  name: string;
  slug: string;
};

export type CurrentMe = {
  user: {
    id: string;
    auth_user_id: string;
    full_name: string;
    email: string;
  };
  business: Workspace;
  role: {
    id: string;
    name: string;
  };
};
