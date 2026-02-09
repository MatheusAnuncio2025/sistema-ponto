import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { usersService, UserRole, UserRow } from "../../services/api/users";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const roleOptions: Array<{ label: string; value: UserRole }> = [
  { label: "Administrador", value: "admin" },
  { label: "RH", value: "hr" },
  { label: "Supervisor", value: "supervisor" },
  { label: "Coordenador", value: "coordinator" },
  { label: "Gerente", value: "manager" },
  { label: "Colaborador", value: "employee" },
];

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const resp = await usersService.list();
      setUsers(resp.users);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((item) => {
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        (item.employee?.employee_code || "").toLowerCase().includes(q);
      const matchesRole = roleFilter === "all" || item.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [users, query, roleFilter]);

  const handleRoleChange = async (target: UserRow, role: UserRole) => {
    setError("");
    setSavingId(target.id);
    try {
      await usersService.updateRole(target.id, role);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar perfil");
    } finally {
      setSavingId(null);
    }
  };

  const handleStatusChange = async (target: UserRow, isActive: boolean) => {
    setError("");
    setSavingId(target.id);
    try {
      await usersService.updateStatus(target.id, isActive);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar status");
    } finally {
      setSavingId(null);
    }
  };

  const renderRoleChip = (role: UserRole) => {
    const label =
      roleOptions.find((item) => item.value === role)?.label || role.toUpperCase();
    return <Chip label={label} size="small" variant="outlined" />;
  };

  return (
    <Box>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Gestão de Usuários
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Defina perfis e status de acesso para colaboradores.
            </Typography>
          </Box>
          <Button variant="text" onClick={() => navigate("/")}>
            Voltar
          </Button>
        </Stack>

        <Paper
          sx={{
            p: 3,
            border: "1px solid rgba(15,23,42,0.06)",
            background: "linear-gradient(180deg, #ffffff, rgba(0,149,48,0.02))",
          }}
        >
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Buscar por nome, e-mail ou código"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              fullWidth
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Perfil</InputLabel>
              <Select
                label="Perfil"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}
              >
                <MenuItem value="all">Todos</MenuItem>
                {roleOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3, border: "1px solid rgba(15,23,42,0.06)" }}>
          {error && (
            <Typography variant="body2" color="error" mb={2}>
              {error}
            </Typography>
          )}
          {loading ? (
            <Typography variant="body2" color="text.secondary">
              Carregando usuários...
            </Typography>
          ) : filteredUsers.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nenhum usuário encontrado.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {filteredUsers.map((item) => {
                const isSelf = item.id === user?.id;
                return (
                  <Paper key={item.id} variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                        <Box sx={{ flex: 1 }}>
                          <Typography fontWeight={600}>{item.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.email}
                          </Typography>
                          <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                            {renderRoleChip(item.role)}
                            {!item.is_active && (
                              <Chip label="Inativo" size="small" color="warning" />
                            )}
                            {item.employee?.employee_code && (
                              <Chip
                                label={`Código: ${item.employee.employee_code}`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        </Box>

                        <Box sx={{ minWidth: 220 }}>
                          <FormControl fullWidth>
                            <InputLabel>Perfil</InputLabel>
                            <Select
                              label="Perfil"
                              value={item.role}
                              onChange={(e) =>
                                handleRoleChange(item, e.target.value as UserRole)
                              }
                              disabled={isSelf || savingId === item.id}
                            >
                              {roleOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>

                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          sx={{ minWidth: 160 }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Ativo
                          </Typography>
                          <Switch
                            checked={item.is_active}
                            onChange={(e) => handleStatusChange(item, e.target.checked)}
                            disabled={isSelf || savingId === item.id}
                          />
                        </Stack>
                      </Stack>

                      {item.employee && (
                        <Stack direction="row" spacing={2} flexWrap="wrap">
                          {item.employee.department && (
                            <Typography variant="caption" color="text.secondary">
                              Dept: {item.employee.department}
                            </Typography>
                          )}
                          {item.employee.position && (
                            <Typography variant="caption" color="text.secondary">
                              Cargo: {item.employee.position}
                            </Typography>
                          )}
                        </Stack>
                      )}
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </Paper>
      </Stack>
    </Box>
  );
};

export default UsersPage;
