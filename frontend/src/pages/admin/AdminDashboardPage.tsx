import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Divider,
  Chip,
  IconButton,
} from "@mui/material";
import { format } from "date-fns";
import {
  adminDashboardService,
  AdminDashboardResponse,
  ReprocessLogItem,
} from "../../services/api/adminDashboard";
import { settingsService } from "../../services/api/settings";

const emptyState: AdminDashboardResponse = {
  success: true,
  date: new Date().toISOString(),
  totals: { employees: 0, punched: 0, late: 0, absent: 0 },
  periods: {
    day: { employees: 0, punched: 0, late: 0, absent: 0 },
    week: { employees: 0, punched: 0, late: 0, absent: 0 },
    month: { employees: 0, punched: 0, late: 0, absent: 0 },
  },
  lists: { punched: [], late: [], absent: [] },
  series: [],
};

const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<AdminDashboardResponse>(emptyState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [scheduleFilter, setScheduleFilter] = useState("all");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoError, setLogoError] = useState("");
  const [reprocessLoading, setReprocessLoading] = useState(false);
  const [reprocessLogs, setReprocessLogs] = useState<ReprocessLogItem[]>([]);
  const [logStart, setLogStart] = useState("");
  const [logEnd, setLogEnd] = useState("");
  const [logLoading, setLogLoading] = useState(false);

  const load = async (params?: {
    date?: string;
    start?: string;
    end?: string;
    department?: string;
    schedule_id?: string;
  }) => {
    try {
      setLoading(true);
      const resp = await adminDashboardService.get(params);
      setData(resp);
      setError("");
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load({
      date: selectedDate,
      department: departmentFilter,
      schedule_id: scheduleFilter,
    });
  }, [selectedDate, departmentFilter, scheduleFilter]);

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const resp = await settingsService.get();
        setLogoUrl(resp.settings.admin_logo_data || "");
      } catch {
        setLogoUrl("");
      }
    };
    loadLogo();
  }, []);

  const loadLogs = async (params?: { start?: string; end?: string }) => {
    try {
      setLogLoading(true);
      const resp = await adminDashboardService.getReprocessLogs(params);
      setReprocessLogs(resp.logs || []);
    } catch {
      setReprocessLogs([]);
    } finally {
      setLogLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const isRangeActive = Boolean(rangeStart && rangeEnd);

  const handleExport = (
    title: string,
    rows: AdminDashboardResponse["lists"]["punched"],
  ) => {
    const header = ["Nome", "E-mail", "Perfil", "Entrada"];
    const lines = rows.map((row) => [
      row.name,
      row.email,
      row.role || "-",
      row.entry_time ? format(new Date(row.entry_time), "HH:mm") : "--:--",
    ]);
    const csv =
      [header, ...lines]
        .map((line) =>
          line
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(";"),
        )
        .join("\n") + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title}-${selectedDate}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    const sections = [
      { title: "Bateram ponto", rows: data.lists.punched },
      { title: "Atrasados", rows: data.lists.late },
      { title: "Ausentes", rows: data.lists.absent },
    ];
    const header = ["Nome", "E-mail", "Perfil", "Entrada"];
    const lines = sections.flatMap((section) => {
      const rows = section.rows.map((row) => [
        row.name,
        row.email,
        row.role || "-",
        row.entry_time ? format(new Date(row.entry_time), "HH:mm") : "--:--",
      ]);
      return [
        [`${section.title}`],
        header,
        ...rows,
        [""],
      ];
    });
    const csv =
      lines
        .map((line) =>
          line
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(";"),
        )
        .join("\n") + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dashboard-admin-${selectedDate}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleSaveLogo = async (payload?: string | null) => {
    try {
      setLogoLoading(true);
      setLogoError("");
      const resp = await settingsService.update({ admin_logo_data: payload ?? logoUrl });
      setLogoUrl(resp.settings.admin_logo_data || "");
    } catch (err: any) {
      setLogoError(err.message || "Erro ao salvar logo");
    } finally {
      setLogoLoading(false);
    }
  };

  const handleLogoFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLogoError("Arquivo inválido. Envie uma imagem.");
      return;
    }
    if (file.size > 1024 * 1024) {
      setLogoError("Imagem muito grande. Limite: 1MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const result = String(reader.result || "");
      setLogoUrl(result);
      setLogoError("");
      await handleSaveLogo(result);
    };
    reader.readAsDataURL(file);
  };

  const handleExportPdf = () => {
    const periodLabel = data.range
      ? `${format(new Date(data.range.start), "dd/MM/yyyy")} - ${format(
          new Date(data.range.end),
          "dd/MM/yyyy",
        )}`
      : format(new Date(data.date), "dd/MM/yyyy");

    const sectionToRows = (title: string, rows: AdminDashboardResponse["lists"]["punched"]) => {
      const header = "<tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Entrada</th></tr>";
      const body =
        rows.length === 0
          ? `<tr><td colspan="4">Nenhum registro.</td></tr>`
          : rows
              .map(
                (row) =>
                  `<tr><td>${row.name}</td><td>${row.email}</td><td>${row.role || "-"}</td><td>${
                    row.entry_time ? format(new Date(row.entry_time), "HH:mm") : "--:--"
                  }</td></tr>`,
              )
              .join("");
      return `<h3>${title}</h3><table>${header}${body}</table>`;
    };

    const logoHtml = logoUrl
      ? `<img src="${logoUrl}" alt="Logo" style="height:48px; margin-bottom: 12px;" />`
      : "";

    const html = `
      <html>
        <head>
          <title>Dashboard Administrativo</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #1f2933; }
            h1 { margin: 0 0 8px; }
            h3 { margin: 24px 0 8px; }
            .meta { margin-bottom: 16px; color: #52606d; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            th, td { border: 1px solid #e0e0e0; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #f5f7f9; }
            .kpis { display: flex; gap: 16px; margin: 12px 0 20px; }
            .kpi { padding: 12px 16px; border: 1px solid #e0e0e0; border-radius: 8px; min-width: 120px; }
            .kpi strong { display: block; font-size: 18px; }
          </style>
        </head>
        <body>
          ${logoHtml}
          <h1>Dashboard Administrativo</h1>
          <div class="meta">Periodo: ${periodLabel}</div>
          <div class="kpis">
            <div class="kpi"><strong>${data.totals.employees}</strong> Colaboradores</div>
            <div class="kpi"><strong>${data.totals.punched}</strong> Batidas</div>
            <div class="kpi"><strong>${data.totals.late}</strong> Atrasos</div>
            <div class="kpi"><strong>${data.totals.absent}</strong> Ausentes</div>
          </div>
          ${sectionToRows("Bateram ponto", data.lists.punched)}
          ${sectionToRows("Atrasados", data.lists.late)}
          ${sectionToRows("Ausentes", data.lists.absent)}
        </body>
      </html>
    `;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };
  const renderTable = (
    title: string,
    rows: AdminDashboardResponse["lists"]["punched"],
  ) => (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.05)",
        boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          onClick={() => handleExport(title, rows)}
          disabled={rows.length === 0}
        >
          Exportar CSV
        </Button>
      </Stack>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>E-mail</TableCell>
              <TableCell>Perfil</TableCell>
              <TableCell>Entrada</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Nenhum registro.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.role || "-"}</TableCell>
                <TableCell>
                  {row.entry_time ? format(new Date(row.entry_time), "HH:mm") : "--:--"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  return (
    <Box sx={{ width: "100%", maxWidth: 1400, mx: "auto" }}>
      <Stack spacing={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            Dashboard Administrativo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Resumo do dia ({format(new Date(data.date), "dd/MM/yyyy")})
          </Typography>
          {error && (
            <Typography variant="body2" color="error" mt={1}>
              {error}
            </Typography>
          )}
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <TextField
              label="Data"
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ maxWidth: 220 }}
            />
            <Button variant="outlined" onClick={() => setSelectedDate(format(new Date(), "yyyy-MM-dd"))}>
              Hoje
            </Button>
            <Button
              variant="contained"
              onClick={() =>
                load({
                  date: selectedDate,
                  department: departmentFilter,
                  schedule_id: scheduleFilter,
                })
              }
              disabled={loading}
            >
              Atualizar
            </Button>
            <Box sx={{ flex: 1 }} />
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel>Departamento</InputLabel>
              <Select
                label="Departamento"
                value={departmentFilter}
                onChange={(event) => setDepartmentFilter(event.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                {(data.filters?.departments || []).map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel>Escala</InputLabel>
              <Select
                label="Escala"
                value={scheduleFilter}
                onChange={(event) => setScheduleFilter(event.target.value)}
              >
                <MenuItem value="all">Todas</MenuItem>
                {(data.filters?.schedules || []).map((schedule) => (
                  <MenuItem key={schedule.id} value={schedule.id}>
                    {schedule.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <TextField
              label="Inicio"
              type="date"
              value={rangeStart}
              onChange={(event) => setRangeStart(event.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ maxWidth: 220 }}
            />
            <TextField
              label="Fim"
              type="date"
              value={rangeEnd}
              onChange={(event) => setRangeEnd(event.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ maxWidth: 220 }}
            />
            <Button
              variant="contained"
              onClick={() =>
                load({
                  start: rangeStart,
                  end: rangeEnd,
                  date: selectedDate,
                  department: departmentFilter,
                  schedule_id: scheduleFilter,
                })
              }
              disabled={!isRangeActive || loading}
            >
              Aplicar intervalo
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setRangeStart("");
                setRangeEnd("");
                load({
                  date: selectedDate,
                  department: departmentFilter,
                  schedule_id: scheduleFilter,
                });
              }}
              disabled={loading}
            >
              Limpar intervalo
            </Button>
            {isRangeActive && data.range && (
              <Chip
                color="success"
                label={`Periodo: ${format(new Date(data.range.start), "dd/MM")} - ${format(new Date(data.range.end), "dd/MM")}`}
              />
            )}
          </Stack>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} mt={2}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ flex: 1 }}>
              <Button variant="outlined" component="label" disabled={logoLoading}>
                Enviar logo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(event) => handleLogoFile(event.target.files?.[0])}
                />
              </Button>
              {logoUrl && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <img
                    src={logoUrl}
                    alt="Logo"
                    style={{ height: 40, borderRadius: 6 }}
                  />
                  <IconButton
                    aria-label="Remover logo"
                    onClick={async () => {
                      setLogoUrl("");
                      await handleSaveLogo(null);
                    }}
                    size="small"
                  >
                    ✕
                  </IconButton>
                </Stack>
              )}
              {logoError && (
                <Typography variant="caption" color="error">
                  {logoError}
                </Typography>
              )}
            </Stack>
            <Button
              variant="outlined"
              onClick={async () => {
                const ok = window.confirm(
                  "Reprocessar banco de horas pode levar alguns minutos. Deseja continuar?",
                );
                if (!ok) return;
                try {
                  setReprocessLoading(true);
                  await adminDashboardService.reprocessHours(
                    isRangeActive ? { start: rangeStart, end: rangeEnd } : undefined,
                  );
                  await loadLogs();
                } finally {
                  setReprocessLoading(false);
                }
              }}
              disabled={reprocessLoading}
            >
              {reprocessLoading ? "Reprocessando..." : "Reprocessar banco de horas"}
            </Button>
            <Button variant="outlined" onClick={handleExportAll} disabled={loading}>
              Exportar tudo (CSV)
            </Button>
            <Button
              variant="contained"
              onClick={() => handleExportPdf()}
              disabled={loading}
            >
              Exportar PDF
            </Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              Resumo por periodo
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                gap: 2,
              }}
            >
              {[
                { label: "Hoje", key: "day" },
                { label: "Semana", key: "week" },
                { label: "Mes", key: "month" },
              ].map((period) => {
                const stats = data.periods?.[period.key as "day" | "week" | "month"] || data.totals;
                return (
                  <Paper
                    key={period.label}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      border: "1px solid rgba(0,0,0,0.05)",
                      boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      {period.label}
                    </Typography>
                    <Stack direction="row" spacing={2} mt={1}>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {loading ? "--" : stats.punched}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Batidas
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {loading ? "--" : stats.late}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Atrasos
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {loading ? "--" : stats.absent}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Ausentes
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}
            </Box>
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
            gap: 2,
          }}
        >
          {[
            { label: "Colaboradores", value: data.totals.employees },
            { label: "Bateram ponto", value: data.totals.punched },
            { label: "Atrasados", value: data.totals.late },
            { label: "Ausentes", value: data.totals.absent },
          ].map((item) => (
            <Paper
              key={item.label}
              sx={{
                p: 3,
                textAlign: "center",
                borderRadius: 3,
                border: "1px solid rgba(0,0,0,0.04)",
                boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
                },
              }}
            >
              <Typography variant="h5" fontWeight={600}>
                {loading ? "--" : item.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
            </Paper>
          ))}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 2,
          }}
        >
          {renderTable("Bateram ponto hoje", data.lists.punched)}
          {renderTable("Atrasados", data.lists.late)}
          {renderTable("Ausentes", data.lists.absent)}
        </Box>

        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Resumo dos ultimos 7 dias
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(7, 1fr)" },
              gap: 1.5,
              alignItems: "end",
            }}
          >
            {(data.series || []).map((point) => {
              const total = Math.max(point.punched, point.late, point.absent, 1);
              return (
                <Box key={point.date}>
                  <Stack spacing={0.5} alignItems="center">
                    <Box
                      sx={{
                        width: "100%",
                        height: 80,
                        borderRadius: 2,
                        backgroundColor: "rgba(0, 149, 48, 0.08)",
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        p: 1,
                      }}
                    >
                      <Stack direction="row" spacing={0.5} alignItems="flex-end">
                        {[
                          { value: point.punched, color: "rgba(0, 149, 48, 0.9)" },
                          { value: point.late, color: "rgba(255, 152, 0, 0.9)" },
                          { value: point.absent, color: "rgba(244, 67, 54, 0.9)" },
                        ].map((bar, index) => (
                          <Box
                            key={index}
                            sx={{
                              width: 8,
                              height: `${Math.max((bar.value / total) * 60, 6)}px`,
                              borderRadius: 2,
                              backgroundColor: bar.color,
                              transition: "height 0.3s ease",
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(point.date), "dd/MM")}
                    </Typography>
                  </Stack>
                </Box>
              );
            })}
          </Box>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "rgba(0, 149, 48, 0.9)" }} />
              <Typography variant="caption">Batidas</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "rgba(255, 152, 0, 0.9)" }} />
              <Typography variant="caption">Atrasos</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "rgba(244, 67, 54, 0.9)" }} />
              <Typography variant="caption">Ausentes</Typography>
            </Stack>
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
            gap: 2,
          }}
        >
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Ranking de atrasos
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>E-mail</TableCell>
                  <TableCell align="right">Qtde</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data.rankings?.late || []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Nenhum atraso no periodo.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {(data.rankings?.late || []).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell align="right">{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Ranking de ausencias
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>E-mail</TableCell>
                  <TableCell align="right">Qtde</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data.rankings?.absent || []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Nenhuma ausencia no periodo.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {(data.rankings?.absent || []).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell align="right">{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>

        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Log de reprocessamento do banco de horas
          </Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={2}>
            <TextField
              label="Início"
              type="date"
              value={logStart}
              onChange={(event) => setLogStart(event.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ maxWidth: 220 }}
            />
            <TextField
              label="Fim"
              type="date"
              value={logEnd}
              onChange={(event) => setLogEnd(event.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ maxWidth: 220 }}
            />
            <Button
              variant="outlined"
              onClick={() => loadLogs({ start: logStart, end: logEnd })}
              disabled={logLoading || !logStart || !logEnd}
            >
              Filtrar
            </Button>
            <Button
              variant="text"
              onClick={() => {
                setLogStart("");
                setLogEnd("");
                loadLogs();
              }}
              disabled={logLoading}
            >
              Limpar
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button
              variant="outlined"
              onClick={() => {
                const header = ["Data/Hora", "Periodo", "Executado por", "Atualizados"];
                const lines = reprocessLogs.map((log) => [
                  log.created_at
                    ? format(new Date(log.created_at), "dd/MM/yyyy HH:mm")
                    : "--",
                  `${format(new Date(log.start_at), "dd/MM/yyyy")} - ${format(
                    new Date(log.end_at),
                    "dd/MM/yyyy",
                  )}`,
                  log.user?.name || "Sistema",
                  String(log.updated_count),
                ]);
                const csv =
                  [header, ...lines]
                    .map((line) =>
                      line
                        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
                        .join(";"),
                    )
                    .join("\n") + "\n";
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `log-reprocessamento-${format(new Date(), "yyyy-MM-dd")}.csv`;
                document.body.appendChild(link);
                link.click();
                link.remove();
                URL.revokeObjectURL(url);
              }}
              disabled={reprocessLogs.length === 0}
            >
              Exportar CSV
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                const html = `
                  <html>
                    <head>
                      <title>Log de Reprocessamento</title>
                      <style>
                        body { font-family: Arial, sans-serif; padding: 24px; color: #1f2933; }
                        h1 { margin: 0 0 16px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #e0e0e0; padding: 8px; text-align: left; font-size: 12px; }
                        th { background: #f5f7f9; }
                      </style>
                    </head>
                    <body>
                      <h1>Log de Reprocessamento do Banco de Horas</h1>
                      <table>
                        <tr>
                          <th>Data/Hora</th>
                          <th>Periodo</th>
                          <th>Executado por</th>
                          <th>Atualizados</th>
                        </tr>
                        ${
                          reprocessLogs.length === 0
                            ? "<tr><td colspan=\"4\">Nenhum registro.</td></tr>"
                            : reprocessLogs
                                .map(
                                  (log) => `
                                    <tr>
                                      <td>${
                                        log.created_at
                                          ? format(new Date(log.created_at), "dd/MM/yyyy HH:mm")
                                          : "--"
                                      }</td>
                                      <td>${format(new Date(log.start_at), "dd/MM/yyyy")} - ${format(
                                        new Date(log.end_at),
                                        "dd/MM/yyyy",
                                      )}</td>
                                      <td>${log.user?.name || "Sistema"}</td>
                                      <td>${log.updated_count}</td>
                                    </tr>
                                  `,
                                )
                                .join("")
                        }
                      </table>
                    </body>
                  </html>
                `;
                const win = window.open("", "_blank");
                if (!win) return;
                win.document.open();
                win.document.write(html);
                win.document.close();
                win.focus();
                win.print();
              }}
              disabled={reprocessLogs.length === 0}
            >
              Exportar PDF
            </Button>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data/Hora</TableCell>
                <TableCell>Periodo</TableCell>
                <TableCell>Executado por</TableCell>
                <TableCell align="right">Atualizados</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reprocessLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Nenhum reprocessamento registrado.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {reprocessLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {log.created_at
                      ? format(new Date(log.created_at), "dd/MM/yyyy HH:mm")
                      : "--"}
                  </TableCell>
                  <TableCell>
                    {format(new Date(log.start_at), "dd/MM/yyyy")} -{" "}
                    {format(new Date(log.end_at), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>{log.user?.name || "Sistema"}</TableCell>
                  <TableCell align="right">{log.updated_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Stack>
    </Box>
  );
};

export default AdminDashboardPage;
