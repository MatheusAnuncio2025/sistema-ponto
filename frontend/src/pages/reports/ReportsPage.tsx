// Arquivo: frontend/src/pages/reports/ReportsPage.tsx

import React, { useMemo } from "react";
import { format, parseISO, startOfMonth, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Box,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useTimeRecord, DayRecord } from "../../contexts/TimeRecordContext";

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function workedMinutes(r: DayRecord): number {
  if (!r.entrada || !r.saida) return 0;
  const intv =
    r.saidaAlmoco && r.retornoAlmoco ? toMinutes(r.retornoAlmoco) - toMinutes(r.saidaAlmoco) : 0;
  return toMinutes(r.saida) - toMinutes(r.entrada) - intv;
}

function fmtH(min: number): string {
  return `${(min / 60).toFixed(1)}h`;
}

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const ReportsPage: React.FC = () => {
  const { records } = useTimeRecord();

  const monthStart = startOfMonth(new Date());
  const monthRecords = useMemo(
    () =>
      records.filter(
        (r) =>
          isAfter(parseISO(r.date), monthStart) ||
          parseISO(r.date).getTime() === monthStart.getTime(),
      ),
    [records, monthStart],
  );

  const totalMin = useMemo(
    () => monthRecords.reduce((s, r) => s + workedMinutes(r), 0),
    [monthRecords],
  );
  const daysWorked = monthRecords.filter((r) => r.entrada && r.saida).length;
  const avgMin = daysWorked > 0 ? totalMin / daysWorked : 0;
  const expectedMin = daysWorked * 8 * 60;
  const balanceMin = totalMin - expectedMin;

  const chartData = useMemo(() => {
    const byDay = [0, 0, 0, 0, 0, 0, 0];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    monthRecords.forEach((r) => {
      const d = parseISO(r.date).getDay();
      byDay[d] += workedMinutes(r) / 60;
      counts[d]++;
    });
    return DAY_LABELS.map((name, i) => ({
      name,
      horas: counts[i] > 0 ? +(byDay[i] / counts[i]).toFixed(1) : 0,
    }));
  }, [monthRecords]);

  return (
    <Box sx={{ width: "100%", maxWidth: 1400, mx: "auto" }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          Relatório — {format(new Date(), "MMMM yyyy", { locale: ptBR })}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Visão geral de horas trabalhadas e médias do mês.
        </Typography>
      </Paper>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                backgroundColor: "rgba(0,149,48,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AccessTimeIcon color="primary" />
            </Box>
            <Box>
              <Typography variant="h6">{fmtH(totalMin)}</Typography>
              <Typography variant="caption" color="text.secondary">
                Total no mês
              </Typography>
            </Box>
          </Stack>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                backgroundColor: "rgba(0,149,48,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CalendarMonthIcon color="primary" />
            </Box>
            <Box>
              <Typography variant="h6">{daysWorked} dias</Typography>
              <Typography variant="caption" color="text.secondary">
                Dias trabalhados
              </Typography>
            </Box>
          </Stack>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                backgroundColor: "rgba(0,149,48,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingUpIcon color="primary" />
            </Box>
            <Box>
              <Typography variant="h6">{fmtH(avgMin)}</Typography>
              <Typography variant="caption" color="text.secondary">
                Média diária
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>

      <Paper
        sx={{
          p: 3,
          mb: 3,
          textAlign: "center",
          border: "1px solid rgba(15,23,42,0.06)",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Saldo de horas
        </Typography>
        <Typography
          variant="h4"
          fontWeight={600}
          color={balanceMin >= 0 ? "success.main" : "error.main"}
        >
          {balanceMin >= 0 ? "+" : ""}
          {fmtH(balanceMin)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Baseado em 8h/dia · {daysWorked} dias úteis
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, border: "1px solid rgba(15,23,42,0.06)" }}>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Média de horas por dia da semana
        </Typography>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="horas" fill="#009530" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default ReportsPage;
