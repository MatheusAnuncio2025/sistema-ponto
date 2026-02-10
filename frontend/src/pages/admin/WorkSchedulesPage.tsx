// Arquivo: frontend/src/pages/admin/WorkSchedulesPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  WorkSchedule,
  WorkScheduleType,
  workScheduleService,
} from "../../services/api/workSchedules";
import { employeesService, Employee } from "../../services/api/employees";

const emptyForm = {
  name: "",
  type: "5x2" as WorkScheduleType,
  work_days: [1, 2, 3, 4, 5],
  start_time: "08:00",
  lunch_start: "12:00",
  lunch_end: "13:00",
  end_time: "17:00",
  tolerance_minutes: "10",
  weekly_hours: "40",
  has_alternating_saturdays: false,
  use_day_rules: false,
  day_rules: {} as Record<
    number,
    { start_time?: string; end_time?: string; lunch_start?: string; lunch_end?: string }
  >,
};

const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const WorkSchedulesPage: React.FC = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [employeeLunchEdits, setEmployeeLunchEdits] = useState<
    Record<string, { lunch_start: string; lunch_end: string }>
  >({});
  const [overrideEdits, setOverrideEdits] = useState<
    Record<string, { until: string; reason: string }>
  >({});

  const scheduleOptions = useMemo(
    () => schedules.map((s) => ({ label: s.name, value: s.id })),
    [schedules],
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [scheduleResp, employeeResp] = await Promise.all([
        workScheduleService.list(),
        employeesService.list(),
      ]);
      setSchedules(scheduleResp.schedules);
      setEmployees(employeeResp.employees);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleWorkDay = (day: number) => {
    setForm((prev) => {
      const exists = prev.work_days.includes(day);
      const nextRules = { ...prev.day_rules };
      if (exists) {
        delete nextRules[day];
      }
      return {
        ...prev,
        work_days: exists
          ? prev.work_days.filter((d) => d !== day)
          : [...prev.work_days, day].sort(),
        day_rules: nextRules,
      };
    });
  };

  const updateDayRule = (
    day: number,
    field: "start_time" | "end_time" | "lunch_start" | "lunch_end",
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      day_rules: {
        ...prev.day_rules,
        [day]: {
          ...(prev.day_rules[day] || {}),
          [field]: value,
        },
      },
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (schedule: WorkSchedule) => {
    setEditingId(schedule.id);
    const incomingRules = schedule.day_rules || {};
    setForm({
      name: schedule.name,
      type: schedule.type,
      work_days: schedule.work_days,
      start_time: schedule.start_time.slice(0, 5),
      lunch_start: schedule.lunch_start ? schedule.lunch_start.slice(0, 5) : "",
      lunch_end: schedule.lunch_end ? schedule.lunch_end.slice(0, 5) : "",
      end_time: schedule.end_time.slice(0, 5),
      tolerance_minutes: String(schedule.tolerance_minutes ?? 10),
      weekly_hours: String(schedule.weekly_hours ?? 40),
      has_alternating_saturdays: schedule.has_alternating_saturdays ?? false,
      use_day_rules: Object.keys(incomingRules).length > 0,
      day_rules: incomingRules,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        work_days: form.work_days,
        start_time: form.start_time,
        lunch_start: form.lunch_start || null,
        lunch_end: form.lunch_end || null,
        end_time: form.end_time,
        day_rules: form.use_day_rules ? form.day_rules : null,
        tolerance_minutes: Number(form.tolerance_minutes),
        weekly_hours: Number(form.weekly_hours),
        has_alternating_saturdays: form.has_alternating_saturdays,
      };

      if (editingId) {
        await workScheduleService.update(editingId, payload);
      } else {
        await workScheduleService.create(payload);
      }

      await loadData();
      resetForm();
      setFormOpen(false);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar escala");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError("");
    try {
      await workScheduleService.remove(id);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Erro ao remover escala");
    }
  };

  const handleAssignSchedule = async (employeeId: string, scheduleId: string) => {
    setError("");
    try {
      await employeesService.updateWorkSchedule(employeeId, scheduleId);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar escala do funcionário");
    }
  };

  const handleLunchChange = (
    employeeId: string,
    field: "lunch_start" | "lunch_end",
    value: string,
  ) => {
    setEmployeeLunchEdits((prev) => ({
      ...prev,
      [employeeId]: {
        lunch_start: prev[employeeId]?.lunch_start ?? "",
        lunch_end: prev[employeeId]?.lunch_end ?? "",
        [field]: value,
      },
    }));
  };

  const handleSaveLunch = async (employee: Employee) => {
    const payload = employeeLunchEdits[employee.id];
    try {
      await employeesService.updateLunch(employee.id, {
        lunch_start: payload?.lunch_start || employee.lunch_start || "",
        lunch_end: payload?.lunch_end || employee.lunch_end || "",
      });
      await loadData();
      setEmployeeLunchEdits((prev) => {
        const next = { ...prev };
        delete next[employee.id];
        return next;
      });
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar almoço");
    }
  };

  const handleClearLunch = async (employee: Employee) => {
    try {
      await employeesService.updateLunch(employee.id, {
        lunch_start: "",
        lunch_end: "",
      });
      await loadData();
    } catch (err: any) {
      setError(err.message || "Erro ao limpar almoço");
    }
  };

  const handleOverrideChange = (
    employeeId: string,
    field: "until" | "reason",
    value: string,
  ) => {
    setOverrideEdits((prev) => ({
      ...prev,
      [employeeId]: {
        until: prev[employeeId]?.until ?? "",
        reason: prev[employeeId]?.reason ?? "",
        [field]: value,
      },
    }));
  };

  const buildOverrideUntil = (timeValue: string) => {
    if (!timeValue) return undefined;
    const [hours, minutes] = timeValue.split(":").map((v) => Number(v));
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return undefined;
    }
    const now = new Date();
    const target = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      0,
      0,
    );
    return target.toISOString();
  };

  const handleSetOverride = async (employee: Employee) => {
    setError("");
    try {
      const payload = overrideEdits[employee.id];
      const override_until = buildOverrideUntil(payload?.until || "");
      await employeesService.setPunchOverride(employee.id, {
        override_until,
        reason: payload?.reason || "",
      });
      await loadData();
    } catch (err: any) {
      setError(err.message || "Erro ao liberar ponto fora da janela");
    }
  };

  const handleClearOverride = async (employee: Employee) => {
    setError("");
    try {
      await employeesService.clearPunchOverride(employee.id);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Erro ao remover liberação");
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1400, mx: "auto" }}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Escalas e Jornadas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Crie escalas e atribua aos funcionários.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={() => {
                resetForm();
                setFormOpen(true);
              }}
            >
              Nova escala
            </Button>
            <Button variant="text" onClick={() => navigate("/")}>
              Voltar
            </Button>
          </Stack>
        </Stack>

        <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>{editingId ? "Editar Escala" : "Nova Escala"}</DialogTitle>
          <DialogContent dividers>
            {error && (
              <Typography variant="body2" color="error" mb={2}>
                {error}
              </Typography>
            )}
            <Box component="form" id="schedule-form" onSubmit={handleSubmit}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "repeat(12, 1fr)" },
                  gap: 2,
                }}
              >
                <Box sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
                  <TextField
                    label="Nome"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      label="Tipo"
                      value={form.type}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          type: e.target.value as WorkScheduleType,
                        }))
                      }
                    >
                      <MenuItem value="5x2">5x2</MenuItem>
                      <MenuItem value="6x1">6x1</MenuItem>
                      <MenuItem value="custom">Personalizada</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ gridColumn: "span 12" }}>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Dias de trabalho
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {dayLabels.map((label, index) => (
                      <Chip
                        key={label}
                        label={label}
                        color={form.work_days.includes(index) ? "primary" : "default"}
                        variant={form.work_days.includes(index) ? "filled" : "outlined"}
                        onClick={() => toggleWorkDay(index)}
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Stack>
                </Box>

                {[
                  { label: "Entrada", name: "start_time" },
                  { label: "Saída", name: "end_time" },
                  { label: "Início do almoço", name: "lunch_start" },
                  { label: "Fim do almoço", name: "lunch_end" },
                ].map((field) => (
                  <Box key={field.name} sx={{ gridColumn: { xs: "span 12", md: "span 3" } }}>
                    <TextField
                      label={field.label}
                      type="time"
                      name={field.name}
                      value={(form as any)[field.name]}
                      onChange={handleChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                ))}

                <Box sx={{ gridColumn: { xs: "span 12", md: "span 4" } }}>
                  <TextField
                    label="Tolerância (min)"
                    name="tolerance_minutes"
                    value={form.tolerance_minutes}
                    onChange={handleChange}
                    fullWidth
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: "span 12", md: "span 4" } }}>
                  <TextField
                    label="Horas semanais"
                    name="weekly_hours"
                    value={form.weekly_hours}
                    onChange={handleChange}
                    fullWidth
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: "span 12", md: "span 4" } }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.has_alternating_saturdays}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            has_alternating_saturdays: e.target.checked,
                          }))
                        }
                      />
                    }
                    label="Sábados alternados"
                  />
                </Box>

                <Box sx={{ gridColumn: "span 12" }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.use_day_rules}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, use_day_rules: e.target.checked }))
                        }
                      />
                    }
                    label="Usar horários por dia da semana"
                  />
                </Box>

                {form.use_day_rules && (
                  <Box sx={{ gridColumn: "span 12" }}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                        gap: 2,
                      }}
                    >
                      {form.work_days.map((day) => (
                        <Paper key={day} variant="outlined" sx={{ p: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            {dayLabels[day]}
                          </Typography>
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "repeat(2, 1fr)",
                              gap: 2,
                            }}
                          >
                            <TextField
                              label="Entrada"
                              type="time"
                              value={form.day_rules[day]?.start_time || ""}
                              onChange={(e) => updateDayRule(day, "start_time", e.target.value)}
                              InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                              label="Saída"
                              type="time"
                              value={form.day_rules[day]?.end_time || ""}
                              onChange={(e) => updateDayRule(day, "end_time", e.target.value)}
                              InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                              label="Início do almoço"
                              type="time"
                              value={form.day_rules[day]?.lunch_start || ""}
                              onChange={(e) => updateDayRule(day, "lunch_start", e.target.value)}
                              InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                              label="Fim do almoço"
                              type="time"
                              value={form.day_rules[day]?.lunch_end || ""}
                              onChange={(e) => updateDayRule(day, "lunch_end", e.target.value)}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setFormOpen(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" form="schedule-form" variant="contained" disabled={saving}>
              {saving ? "Salvando..." : editingId ? "Salvar" : "Adicionar"}
            </Button>
          </DialogActions>
        </Dialog>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
            gap: 3,
          }}
        >
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Escalas cadastradas
            </Typography>
            {loading ? (
              <Typography variant="body2" color="text.secondary">
                Carregando...
              </Typography>
            ) : schedules.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nenhuma escala cadastrada.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {schedules.map((schedule) => (
                  <Paper
                    key={schedule.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                      <Box>
                        <Typography fontWeight={600}>{schedule.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {schedule.type} · {schedule.weekly_hours}h/semana
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Dias: {schedule.work_days.map((d) => dayLabels[d]).join(", ")}
                        </Typography>
                      </Box>
                      <Stack spacing={1}>
                        <Button variant="outlined" onClick={() => handleEdit(schedule)}>
                          Editar
                        </Button>
                        <Button variant="outlined" color="error" onClick={() => handleDelete(schedule.id)}>
                          Remover
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Atribuir escala e almoço por funcionário
            </Typography>
            {loading ? (
              <Typography variant="body2" color="text.secondary">
                Carregando...
              </Typography>
            ) : employees.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nenhum funcionário encontrado.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {employees.map((employee) => (
                  <Paper
                    key={employee.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
                    }}
                  >
                    <Stack spacing={2}>
                      <Box>
                        <Typography fontWeight={600}>{employee.user?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {employee.user?.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Escala atual: {employee.workSchedule?.name || "Nenhuma"}
                        </Typography>
                      </Box>
                      <FormControl fullWidth>
                        <InputLabel>Escala</InputLabel>
                        <Select
                          label="Escala"
                          value={employee.work_schedule_id || ""}
                          onChange={(e) =>
                            handleAssignSchedule(employee.id, e.target.value as string)
                          }
                        >
                          {scheduleOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: 2,
                        }}
                      >
                        <TextField
                          label="Almoço (saída)"
                          type="time"
                          value={
                            employeeLunchEdits[employee.id]?.lunch_start ??
                            (employee.lunch_start ? employee.lunch_start.slice(0, 5) : "")
                          }
                          onChange={(e) =>
                            handleLunchChange(employee.id, "lunch_start", e.target.value)
                          }
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          label="Almoço (retorno)"
                          type="time"
                          value={
                            employeeLunchEdits[employee.id]?.lunch_end ??
                            (employee.lunch_end ? employee.lunch_end.slice(0, 5) : "")
                          }
                          onChange={(e) =>
                            handleLunchChange(employee.id, "lunch_end", e.target.value)
                          }
                          InputLabelProps={{ shrink: true }}
                        />
                      </Box>

                      <Stack direction="row" spacing={2}>
                        <Button variant="contained" onClick={() => handleSaveLunch(employee)}>
                          Salvar
                        </Button>
                        <Button variant="outlined" onClick={() => handleClearLunch(employee)}>
                          Limpar
                        </Button>
                      </Stack>

                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Liberação para bater ponto fora da janela
                        </Typography>
                        {employee.punch_override_until ? (
                          <Typography variant="body2" color="text.secondary" mb={1}>
                            Ativo até: {new Date(employee.punch_override_until).toLocaleString()}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary" mb={1}>
                            Nenhuma liberação ativa.
                          </Typography>
                        )}
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: "120px 1fr" },
                            gap: 2,
                            mb: 2,
                          }}
                        >
                          <TextField
                            label="Liberar até"
                            type="time"
                            value={overrideEdits[employee.id]?.until ?? ""}
                            onChange={(e) =>
                              handleOverrideChange(employee.id, "until", e.target.value)
                            }
                            InputLabelProps={{ shrink: true }}
                          />
                          <TextField
                            label="Motivo"
                            value={overrideEdits[employee.id]?.reason ?? ""}
                            onChange={(e) =>
                              handleOverrideChange(employee.id, "reason", e.target.value)
                            }
                          />
                        </Box>
                        <Stack direction="row" spacing={2}>
                          <Button variant="contained" onClick={() => handleSetOverride(employee)}>
                            Liberar hoje
                          </Button>
                          <Button variant="outlined" onClick={() => handleClearOverride(employee)}>
                            Remover liberação
                          </Button>
                        </Stack>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
};

export default WorkSchedulesPage;
