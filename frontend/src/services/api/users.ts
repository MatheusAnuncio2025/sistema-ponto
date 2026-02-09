import api from "./auth";

export type UserRole =
  | "admin"
  | "hr"
  | "supervisor"
  | "coordinator"
  | "manager"
  | "employee";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  employee?: {
    id: string;
    employee_code?: string | null;
    department?: string | null;
    position?: string | null;
    hire_date?: string | null;
  } | null;
}

export interface UserListResponse {
  success: boolean;
  users: UserRow[];
}

export const usersService = {
  async list(): Promise<UserListResponse> {
    const response = await api.get<UserListResponse>("/users");
    return response.data;
  },

  async updateRole(userId: string, role: UserRole): Promise<{ success: boolean }> {
    const response = await api.patch<{ success: boolean }>(`/users/${userId}/role`, {
      role,
    });
    return response.data;
  },

  async updateStatus(
    userId: string,
    is_active: boolean,
  ): Promise<{ success: boolean }> {
    const response = await api.patch<{ success: boolean }>(`/users/${userId}/status`, {
      is_active,
    });
    return response.data;
  },
};
