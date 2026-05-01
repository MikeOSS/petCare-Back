import type { User } from "@/.generated/client";

// O que devolvemos para o cliente — nunca a senha nem dados sensíveis de convite.
export type PublicUser = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: string;
  status: string;
  created_at: Date;
  updated_at: Date;
};

export function sanitizeUser(user: User): PublicUser {
  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    role: user.role,
    status: user.status,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}
