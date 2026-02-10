// Arquivo: frontend/src/pages/admin/WorkLocationsPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { WorkLocation, workLocationService } from "../../services/api/workLocations";

const emptyForm = {
  name: "",
  address: "",
  latitude: "",
  longitude: "",
  radius: "100",
};

const WorkLocationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<WorkLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const activeLocations = useMemo(
    () => locations.filter((loc) => loc.is_active),
    [locations],
  );

  const inactiveLocations = useMemo(
    () => locations.filter((loc) => !loc.is_active),
    [locations],
  );

  const loadLocations = async () => {
    try {
      setLoading(true);
      const response = await workLocationService.list();
      setLocations(response.locations);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar locais");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (location: WorkLocation) => {
    setEditingId(location.id);
    setForm({
      name: location.name,
      address: location.address || "",
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      radius: String(location.radius),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        address: form.address.trim() || undefined,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        radius: form.radius ? Number(form.radius) : undefined,
      };

      if (editingId) {
        await workLocationService.update(editingId, payload);
      } else {
        await workLocationService.create(payload);
      }

      await loadLocations();
      resetForm();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar local");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    setError("");
    try {
      await workLocationService.deactivate(id);
      await loadLocations();
    } catch (err: any) {
      setError(err.message || "Erro ao desativar local");
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1400, mx: "auto" }}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Locais Permitidos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gerencie os locais e raios de marcação.
            </Typography>
          </Box>
          <Button variant="text" onClick={() => navigate("/")}>
            Voltar
          </Button>
        </Stack>

        <Paper sx={{ p: 3, border: "1px solid rgba(15,23,42,0.06)" }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {editingId ? "Editar Local" : "Novo Local"}
          </Typography>
          {error && (
            <Typography variant="body2" color="error" mb={2}>
              {error}
            </Typography>
          )}
          <Box component="form" onSubmit={handleSubmit}>
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
                <TextField
                  label="Endereço (opcional)"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  fullWidth
                />
              </Box>
              <Box sx={{ gridColumn: { xs: "span 12", md: "span 4" } }}>
                <TextField
                  label="Latitude"
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Box>
              <Box sx={{ gridColumn: { xs: "span 12", md: "span 4" } }}>
                <TextField
                  label="Longitude"
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Box>
              <Box sx={{ gridColumn: { xs: "span 12", md: "span 4" } }}>
                <TextField
                  label="Raio (metros)"
                  name="radius"
                  value={form.radius}
                  onChange={handleChange}
                  fullWidth
                />
              </Box>
              <Box sx={{ gridColumn: "span 12" }}>
                <Stack direction="row" spacing={2}>
                  <Button type="submit" variant="contained" disabled={saving}>
                    {saving ? "Salvando..." : editingId ? "Salvar" : "Adicionar"}
                  </Button>
                  {editingId && (
                    <Button variant="outlined" onClick={resetForm}>
                      Cancelar
                    </Button>
                  )}
                </Stack>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
            gap: 3,
          }}
        >
          <Paper sx={{ p: 3, border: "1px solid rgba(15,23,42,0.06)" }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Locais Ativos
            </Typography>
            {loading ? (
              <Typography variant="body2" color="text.secondary">
                Carregando...
              </Typography>
            ) : activeLocations.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nenhum local ativo.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {activeLocations.map((location) => (
                  <Paper key={location.id} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                      <Box>
                        <Typography fontWeight={600}>{location.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {location.address || "Sem endereço"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Lat: {location.latitude} · Lng: {location.longitude} · Raio:{" "}
                          {location.radius}m
                        </Typography>
                      </Box>
                      <Stack spacing={1}>
                        <Button variant="outlined" onClick={() => handleEdit(location)}>
                          Editar
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeactivate(location.id)}
                        >
                          Desativar
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>

          <Paper sx={{ p: 3, border: "1px solid rgba(15,23,42,0.06)" }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Locais Inativos
            </Typography>
            {loading ? (
              <Typography variant="body2" color="text.secondary">
                Carregando...
              </Typography>
            ) : inactiveLocations.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nenhum local inativo.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {inactiveLocations.map((location) => (
                  <Paper key={location.id} variant="outlined" sx={{ p: 2 }}>
                    <Typography fontWeight={600}>{location.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {location.address || "Sem endereço"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Lat: {location.latitude} · Lng: {location.longitude} · Raio:{" "}
                      {location.radius}m
                    </Typography>
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

export default WorkLocationsPage;
