// Arquivo: frontend/src/pages/history/HistoryPage.tsx

import React, { useMemo, useState } from "react";
import { format, subDays, isAfter, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Typography,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useTimeRecord, DayRecord } from "../../contexts/TimeRecordContext";

function totalHours(r: DayRecord): string {
  if (!r.entrada || !r.saida) return "--:--";
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const intv =
    r.saidaAlmoco && r.retornoAlmoco ? toMin(r.retornoAlmoco) - toMin(r.saidaAlmoco) : 0;
  const total = toMin(r.saida) - toMin(r.entrada) - intv;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function isIncomplete(r: DayRecord): boolean {
  return !r.entrada || !r.saidaAlmoco || !r.retornoAlmoco || !r.saida;
}

const HistoryPage: React.FC = () => {
  const { records } = useTimeRecord();
  const [period, setPeriod] = useState<7 | 30>(7);

  const filtered = useMemo(() => {
    const cutoff = subDays(new Date(), period);
    return records
      .filter((r) => isAfter(parseISO(r.date), cutoff))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [records, period]);

  return (
    <Box sx={{ width: "100%", maxWidth: 1400, mx: "auto" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight={600}>
          Histórico de Registros
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant={period === 7 ? "contained" : "outlined"}
            size="small"
            onClick={() => setPeriod(7)}
          >
            7 dias
          </Button>
          <Button
            variant={period === 30 ? "contained" : "outlined"}
            size="small"
            onClick={() => setPeriod(30)}
          >
            30 dias
          </Button>
        </Stack>
      </Stack>

      <Paper sx={{ p: 2, border: "1px solid rgba(15,23,42,0.06)" }}>
        <TableContainer>
          <Table>
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Entrada</TableCell>
              <TableCell>Saída Almoço</TableCell>
              <TableCell>Retorno</TableCell>
              <TableCell>Saída</TableCell>
              <TableCell>Localização (entrada)</TableCell>
              <TableCell>Total</TableCell>
              <TableCell width={36}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Nenhum registro encontrado.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {filtered.map((r) => (
              <TableRow key={r.date}>
                <TableCell>
                  {format(parseISO(r.date), "dd/MM (EEE)", { locale: ptBR })}
                </TableCell>
                <TableCell>{r.entrada || "--:--"}</TableCell>
                <TableCell>{r.saidaAlmoco || "--:--"}</TableCell>
                <TableCell>{r.retornoAlmoco || "--:--"}</TableCell>
                <TableCell>{r.saida || "--:--"}</TableCell>
                <TableCell>
                  {r.locations?.entrada
                    ? `${r.locations.entrada.latitude.toFixed(5)}, ${r.locations.entrada.longitude.toFixed(5)}`
                    : "--"}
                </TableCell>
                <TableCell>{totalHours(r)}</TableCell>
                <TableCell>
                  {isIncomplete(r) && <WarningAmberIcon color="warning" fontSize="small" />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default HistoryPage;
