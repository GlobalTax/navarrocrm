import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, CheckCircle2, XCircle, Paperclip, Filter, Download, AlertCircle, Clock } from "lucide-react";
import { format, addMonths, addYears, isBefore, parseISO, addDays, isAfter, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";

// Tipos
type Frecuencia = "mensual" | "trimestral" | "anual";
type EstadoCuota = "activa" | "pausada" | "cancelada" | "vencida";
type EstadoCobro = "pendiente" | "pagado" | "vencido";
type Prioridad = "alta" | "media" | "baja";

type HistorialCobro = {
  id: string;
  fecha: string; // ISO
  estado: EstadoCobro;
  acciones: string[]; // Registro de acciones/notificaciones
};

type CuotaRecurrente = {
  id: string;
  cliente: string;
  nombre: string;
  descripcion?: string;
  importe: number;
  frecuencia: Frecuencia;
  fechaInicio: string; // ISO
  duracionMeses?: number; // Opcional, indefinida si no se indica
  estado: EstadoCuota;
  prioridad: Prioridad;
  etiquetas: string[];
  notas: string;
  adjuntos: string[]; // Simulación: nombres de archivos
  historial: HistorialCobro[];
  registro: string[]; // Registro de acciones/notificaciones globales
};

// Utilidades
function generarProximosCobros(
  cuota: CuotaRecurrente,
  hasta: Date,
  hoy: Date
): HistorialCobro[] {
  const cobros: HistorialCobro[] = [];
  let fecha = parseISO(cuota.fechaInicio);
  let mesesPorPeriodo = cuota.frecuencia === "mensual" ? 1 : cuota.frecuencia === "trimestral" ? 3 : 12;
  let totalMeses = cuota.duracionMeses ?? 120; // 10 años por defecto si es indefinida
  let iteraciones = Math.ceil(totalMeses / mesesPorPeriodo);
  for (let i = 0; i < iteraciones; i++) {
    if (isBefore(fecha, hasta)) {
      const id = `${cuota.id}-${i}`;
      if (!cuota.historial.some((h) => h.id === id)) {
        let estado: EstadoCobro = isBefore(fecha, hoy) ? "vencido" : "pendiente";
        cobros.push({
          id,
          fecha: fecha.toISOString(),
          estado,
          acciones: [
            `Cobro generado automáticamente para el ${format(fecha, "dd/MM/yyyy")}`,
            ...(estado === "vencido"
              ? [
                  `Cobro marcado como vencido automáticamente (fecha pasada)`,
                  `Notificación enviada al cliente por impago`,
                ]
              : [`Notificación enviada al cliente de nuevo cobro`]),
          ],
        });
      }
      fecha = addMonths(fecha, mesesPorPeriodo);
    }
  }
  return cobros;
}

function exportarCSV(data: any[], headers: string[], filename: string) {
  const csv =
    headers.join(",") +
    "\n" +
    data
      .map((row) =>
        headers
          .map((h) =>
            typeof row[h] === "string"
              ? `"${row[h].replace(/"/g, '""')}"`
              : row[h]
          )
          .join(",")
      )
      .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

const etiquetasDisponibles = [
  "Fiscal",
  "Laboral",
  "Jurídico",
  "Contable",
  "Premium",
  "Urgente",
];

const RecurrentFees = () => {
  // Estado global
  const [cuotas, setCuotas] = useState<CuotaRecurrente[]>([]);
  const [form, setForm] = useState<Omit<CuotaRecurrente, "id" | "historial" | "estado" | "registro">>({
    cliente: "",
    nombre: "",
    descripcion: "",
    importe: 0,
    frecuencia: "mensual",
    fechaInicio: format(new Date(), "yyyy-MM-dd"),
    duracionMeses: undefined,
    prioridad: "media",
    etiquetas: [],
    notas: "",
    adjuntos: [],
  });
  const [showForm, setShowForm] = useState(false);
  const [detalleCuota, setDetalleCuota] = useState<CuotaRecurrente | null>(null);
  const [hoy, setHoy] = useState(new Date());
  const [filtros, setFiltros] = useState<{
    estado?: EstadoCuota;
    cliente?: string;
    frecuencia?: Frecuencia;
    prioridad?: Prioridad;
    etiqueta?: string;
  }>({});

  // Workflows automáticos: al avanzar el día, se generan cobros y se actualizan estados
  function simularDiaActual() {
    setHoy((prev) => {
      const nuevoDia = addDays(prev, 1);
      setCuotas((prevCuotas) =>
        prevCuotas.map((cuota) => {
          // Generar cobros nuevos si corresponde
          const nuevosCobros = generarProximosCobros(
            cuota,
            addYears(nuevoDia, 1),
            nuevoDia
          );
          let historial = [...cuota.historial, ...nuevosCobros];
          // Cambiar estado de cobros pendientes a vencido si han pasado 10 días
          historial = historial.map((h) => {
            if (
              h.estado === "pendiente" &&
              isBefore(parseISO(h.fecha), nuevoDia) &&
              differenceInDays(nuevoDia, parseISO(h.fecha)) > 10
            ) {
              return {
                ...h,
                estado: "vencido",
                acciones: [
                  ...h.acciones,
                  `Cobro marcado como vencido automáticamente (más de 10 días sin pagar)`,
                  `Notificación enviada al cliente por impago`,
                ],
              };
            }
            return h;
          });
          // Cambiar estado de cuota si hay cobros vencidos
          const hayVencidos = historial.some((h) => h.estado === "vencido");
          let estado: EstadoCuota = cuota.estado;
          let registro = [...(cuota.registro || [])];
          if (hayVencidos && cuota.estado === "activa") {
            estado = "vencida";
            registro.push(
              `Cuota marcada como vencida automáticamente (${format(
                nuevoDia,
                "dd/MM/yyyy"
              )})`
            );
          }
          return { ...cuota, historial, estado, registro };
        })
      );
      return nuevoDia;
    });
  }

  function handleAddCuota() {
    const nueva: CuotaRecurrente = {
      ...form,
      id: crypto.randomUUID(),
      estado: "activa",
      historial: [],
      registro: [
        `Cuota creada el ${format(hoy, "dd/MM/yyyy")}`,
        ...(form.prioridad === "alta"
          ? ["Notificación interna: cuota de alta prioridad"]
          : []),
      ],
    };
    setCuotas((prev) => [...prev, nueva]);
    setForm({
      cliente: "",
      nombre: "",
      descripcion: "",
      importe: 0,
      frecuencia: "mensual",
      fechaInicio: format(hoy, "yyyy-MM-dd"),
      duracionMeses: undefined,
      prioridad: "media",
      etiquetas: [],
      notas: "",
      adjuntos: [],
    });
    setShowForm(false);
  }

  function handleGenerarCobros(cuota: CuotaRecurrente) {
    // Genera cobros hasta 1 año en el futuro
    const hasta = addYears(hoy, 1);
    const nuevos = generarProximosCobros(cuota, hasta, hoy);
    if (nuevos.length === 0) return;
    setCuotas((prev) =>
      prev.map((c) =>
        c.id === cuota.id
          ? {
              ...c,
              historial: [...c.historial, ...nuevos],
              registro: [
                ...(c.registro || []),
                `Cobros generados manualmente el ${format(hoy, "dd/MM/yyyy")}`,
              ],
            }
          : c
      )
    );
  }

  function handleMarcarPagado(cuotaId: string, cobroId: string) {
    setCuotas((prev) =>
      prev.map((c) =>
        c.id === cuotaId
          ? {
              ...c,
              historial: c.historial.map((h) =>
                h.id === cobroId
                  ? {
                      ...h,
                      estado: "pagado",
                      acciones: [
                        ...h.acciones,
                        `Cobro marcado como pagado manualmente el ${format(
                          hoy,
                          "dd/MM/yyyy"
                        )}`,
                        `Notificación interna: cobro pagado`,
                      ],
                    }
                  : h
              ),
              registro: [
                ...(c.registro || []),
                `Cobro marcado como pagado el ${format(hoy, "dd/MM/yyyy")}`,
              ],
              estado:
                c.historial.filter((h) => h.id === cobroId && h.estado === "vencido").length > 0
                  ? "activa"
                  : c.estado,
            }
          : c
      )
    );
  }

  function handleEliminarCuota(id: string) {
    setCuotas((prev) => prev.filter((c) => c.id !== id));
    setDetalleCuota(null);
  }

  function handleAdjuntarArchivo(nombre: string) {
    setForm((f) => ({
      ...f,
      adjuntos: [...f.adjuntos, nombre],
    }));
  }

  // Filtros
  const cuotasFiltradas = cuotas.filter((c) => {
    if (filtros.estado && filtros.estado !== "all" && c.estado !== filtros.estado) return false;
    if (filtros.cliente && !c.cliente.toLowerCase().includes(filtros.cliente.toLowerCase())) return false;
    if (filtros.frecuencia && filtros.frecuencia !== "all" && c.frecuencia !== filtros.frecuencia) return false;
    if (filtros.prioridad && filtros.prioridad !== "all" && c.prioridad !== filtros.prioridad) return false;
    if (filtros.etiqueta && filtros.etiqueta !== "all" && !c.etiquetas.includes(filtros.etiqueta)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cuotas Recurrentes</h1>
        <p className="text-gray-600">
          Gestión avanzada de cuotas recurrentes y facturación automática
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cuotas recurrentes premium</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={simularDiaActual} title="Simular avance de día">
                <Clock className="w-4 h-4 mr-2" />
                Simular día actual ({format(hoy, "dd/MM/yyyy")})
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  exportarCSV(
                    cuotas,
                    [
                      "cliente",
                      "nombre",
                      "importe",
                      "frecuencia",
                      "fechaInicio",
                      "duracionMeses",
                      "estado",
                      "prioridad",
                      "etiquetas",
                    ],
                    "cuotas.csv"
                  )
                }
                title="Exportar cuotas a CSV"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar cuotas
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  exportarCSV(
                    cuotas
                      .flatMap((c) =>
                        c.historial.map((h) => ({
                          cliente: c.cliente,
                          cuota: c.nombre,
                          fecha: format(parseISO(h.fecha), "dd/MM/yyyy"),
                          estado: h.estado,
                          acciones: h.acciones.join(" | "),
                        }))
                      ),
                    ["cliente", "cuota", "fecha", "estado", "acciones"],
                    "cobros.csv"
                  )
                }
                title="Exportar cobros a CSV"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar cobros
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button onClick={() => setShowForm((v) => !v)}>
              <Plus className="w-4 h-4 mr-2" />
              {showForm ? "Cerrar formulario" : "Nueva cuota recurrente"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setFiltros({})}
              title="Limpiar filtros"
            >
              <Filter className="w-4 h-4 mr-2" />
              Limpiar filtros
            </Button>
            <Input
              placeholder="Filtrar por cliente"
              className="w-40"
              value={filtros.cliente ?? ""}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, cliente: e.target.value }))
              }
            />
            <Select
              value={filtros.estado ?? "all"}
              onValueChange={(v) =>
                setFiltros((f) => ({
                  ...f,
                  estado: v === "all" ? undefined : (v as EstadoCuota),
                }))
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="activa">Activa</SelectItem>
                <SelectItem value="pausada">Pausada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
                <SelectItem value="vencida">Vencida</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filtros.frecuencia ?? "all"}
              onValueChange={(v) =>
                setFiltros((f) => ({
                  ...f,
                  frecuencia: v === "all" ? undefined : (v as Frecuencia),
                }))
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Frecuencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="mensual">Mensual</SelectItem>
                <SelectItem value="trimestral">Trimestral</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filtros.prioridad ?? "all"}
              onValueChange={(v) =>
                setFiltros((f) => ({
                  ...f,
                  prioridad: v === "all" ? undefined : (v as Prioridad),
                }))
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filtros.etiqueta ?? "all"}
              onValueChange={(v) =>
                setFiltros((f) => ({
                  ...f,
                  etiqueta: v === "all" ? undefined : v,
                }))
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Etiqueta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {etiquetasDisponibles.map((et) => (
                  <SelectItem key={et} value={et}>
                    {et}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {showForm && (
            <div className="mb-6 border p-4 rounded-lg bg-muted/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Cliente</Label>
                  <Input
                    value={form.cliente}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, cliente: e.target.value }))
                    }
                    placeholder="Nombre del cliente"
                  />
                </div>
                <div>
                  <Label>Nombre de la cuota</Label>
                  <Input
                    value={form.nombre}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, nombre: e.target.value }))
                    }
                    placeholder="Ej: Asesoría fiscal mensual"
                  />
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Input
                    value={form.descripcion}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, descripcion: e.target.value }))
                    }
                    placeholder="Descripción opcional"
                  />
                </div>
                <div>
                  <Label>Importe (€)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.importe}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        importe: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Frecuencia</Label>
                  <Select
                    value={form.frecuencia}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        frecuencia: v as Frecuencia,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Frecuencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mensual">Mensual</SelectItem>
                      <SelectItem value="trimestral">Trimestral</SelectItem>
                      <SelectItem value="anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fecha de inicio</Label>
                  <Input
                    type="date"
                    value={form.fechaInicio}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        fechaInicio: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Duración (meses, opcional)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.duracionMeses ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        duracionMeses: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                    placeholder="Ej: 12 (dejar vacío si es indefinida)"
                  />
                </div>
                <div>
                  <Label>Prioridad</Label>
                  <Select
                    value={form.prioridad}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        prioridad: v as Prioridad,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="baja">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Etiquetas</Label>
                  <div className="flex flex-wrap gap-1">
                    {etiquetasDisponibles.map((et) => (
                      <Badge
                        key={et}
                        variant={
                          form.etiquetas.includes(et) ? "default" : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() =>
                          setForm((f) =>
                            f.etiquetas.includes(et)
                              ? {
                                  ...f,
                                  etiquetas: f.etiquetas.filter((e) => e !== et),
                                }
                              : {
                                  ...f,
                                  etiquetas: [...f.etiquetas, et],
                                }
                          )
                        }
                      >
                        {et}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label>Notas internas</Label>
                  <Input
                    value={form.notas}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notas: e.target.value }))
                    }
                    placeholder="Notas internas (solo visibles para el equipo)"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Adjuntos (simulado)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Nombre del archivo"
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          e.currentTarget.value.trim() !== ""
                        ) {
                          handleAdjuntarArchivo(e.currentTarget.value.trim());
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => {
                        const nombre = prompt("Nombre del archivo:");
                        if (nombre) handleAdjuntarArchivo(nombre);
                      }}
                    >
                      <Paperclip className="w-4 h-4 mr-1" />
                      Adjuntar
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.adjuntos.map((a, i) => (
                      <Badge key={i} variant="secondary">
                        <Paperclip className="w-3 h-3 mr-1" />
                        {a}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Button
                className="mt-4"
                onClick={handleAddCuota}
                disabled={
                  !form.cliente ||
                  !form.nombre ||
                  !form.importe ||
                  !form.frecuencia ||
                  !form.fechaInicio
                }
              >
                Guardar cuota
              </Button>
            </div>
          )}

          <ScrollArea className="h-80 pr-2">
            {cuotasFiltradas.length === 0 && (
              <div className="text-muted-foreground text-center py-8">
                No hay cuotas recurrentes que cumplan los filtros.
              </div>
            )}
            {cuotasFiltradas.map((cuota) => (
              <Card
                key={cuota.id}
                className={`mb-4 border-2 border-muted relative cursor-pointer hover:shadow-lg transition ${
                  cuota.estado === "vencida"
                    ? "border-red-400"
                    : cuota.prioridad === "alta"
                    ? "border-yellow-400"
                    : ""
                }`}
                onClick={() => setDetalleCuota(cuota)}
              >
                <CardContent className="pt-4 space-y-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{cuota.nombre}</div>
                      <div className="text-xs text-muted-foreground">
                        Cliente: {cuota.cliente}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {cuota.etiquetas.map((et) => (
                          <Badge key={et} variant="secondary">
                            {et}
                          </Badge>
                        ))}
                        <Badge
                          variant={
                            cuota.prioridad === "alta"
                              ? "destructive"
                              : cuota.prioridad === "media"
                              ? "default"
                              : "outline"
                          }
                        >
                          {cuota.prioridad.charAt(0).toUpperCase() +
                            cuota.prioridad.slice(1)}
                        </Badge>
                        <Badge
                          variant={
                            cuota.estado === "vencida"
                              ? "destructive"
                              : cuota.estado === "activa"
                              ? "default"
                              : "outline"
                          }
                        >
                          {cuota.estado.charAt(0).toUpperCase() +
                            cuota.estado.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {cuota.importe.toFixed(2)} €
                      </div>
                      <div className="text-xs">
                        {cuota.frecuencia.charAt(0).toUpperCase() +
                          cuota.frecuencia.slice(1)}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Inicio: {format(parseISO(cuota.fechaInicio), "dd/MM/yyyy")}
                    {cuota.duracionMeses
                      ? ` · ${cuota.duracionMeses} meses`
                      : " · Indefinida"}
                  </div>
                </CardContent>
              </Card>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Detalle de cuota */}
      {detalleCuota && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-background rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2"
              onClick={() => setDetalleCuota(null)}
              title="Cerrar"
            >
              <XCircle className="w-5 h-5" />
            </Button>
            <div className="mb-2 text-xl font-bold">{detalleCuota.nombre}</div>
            <div className="mb-1 text-muted-foreground">
              Cliente: <span className="font-semibold">{detalleCuota.cliente}</span>
            </div>
            <div className="mb-2 text-sm">{detalleCuota.descripcion}</div>
            <div className="mb-2">
              <span className="font-semibold">Importe:</span>{" "}
              {detalleCuota.importe.toFixed(2)} €
            </div>
            <div className="mb-2">
              <span className="font-semibold">Frecuencia:</span>{" "}
              {detalleCuota.frecuencia.charAt(0).toUpperCase() +
                detalleCuota.frecuencia.slice(1)}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Inicio:</span>{" "}
              {format(parseISO(detalleCuota.fechaInicio), "dd/MM/yyyy")}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Duración:</span>{" "}
              {detalleCuota.duracionMeses
                ? `${detalleCuota.duracionMeses} meses`
                : "Indefinida"}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Prioridad:</span>{" "}
              {detalleCuota.prioridad.charAt(0).toUpperCase() +
                detalleCuota.prioridad.slice(1)}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Etiquetas:</span>{" "}
              {detalleCuota.etiquetas.map((et) => (
                <Badge key={et} variant="secondary" className="mr-1">
                  {et}
                </Badge>
              ))}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Notas internas:</span>{" "}
              <span className="text-muted-foreground">{detalleCuota.notas}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Adjuntos:</span>{" "}
              {detalleCuota.adjuntos.length === 0
                ? "Ninguno"
                : detalleCuota.adjuntos.map((a, i) => (
                    <Badge key={i} variant="secondary" className="mr-1">
                      <Paperclip className="w-3 h-3 mr-1" />
                      {a}
                    </Badge>
                  ))}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Estado:</span>{" "}
              {detalleCuota.estado.charAt(0).toUpperCase() +
                detalleCuota.estado.slice(1)}
            </div>
            <Button
              variant="outline"
              className="mb-4"
              onClick={() => handleGenerarCobros(detalleCuota)}
            >
              Generar próximos cobros
            </Button>
            <div className="font-semibold mb-2">Historial de cobros</div>
            <ScrollArea className="h-40 pr-2">
              {detalleCuota.historial.length === 0 && (
                <div className="text-muted-foreground text-center py-4">
                  No hay cobros generados aún.
                </div>
              )}
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left">Fecha</th>
                    <th className="text-center">Estado</th>
                    <th className="text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {detalleCuota.historial
                    .sort((a, b) => a.fecha.localeCompare(b.fecha))
                    .map((h) => (
                      <tr key={h.id}>
                        <td>
                          {format(parseISO(h.fecha), "dd/MM/yyyy", { locale: es })}
                        </td>
                        <td className="text-center">
                          {h.estado === "pagado" ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Pagado
                            </span>
                          ) : h.estado === "vencido" ? (
                            <span className="text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" /> Vencido
                            </span>
                          ) : (
                            <span className="text-yellow-600 flex items-center gap-1">
                              <Clock className="w-4 h-4" /> Pendiente
                            </span>
                          )}
                        </td>
                        <td className="text-right">
                          {h.estado === "pendiente" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                handleMarcarPagado(detalleCuota.id, h.id)
                              }
                            >
                              Marcar como pagado
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </ScrollArea>
            <div className="font-semibold mt-4 mb-2">Registro de acciones y notificaciones</div>
            <ScrollArea className="h-24 pr-2 mb-2">
              <ul className="text-xs list-disc pl-4">
                {detalleCuota.registro.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
                {detalleCuota.historial
                  .flatMap((h) => h.acciones)
                  .map((a, i) => (
                    <li key={`h-${i}`}>{a}</li>
                  ))}
              </ul>
            </ScrollArea>
            <Button
              variant="destructive"
              className="mt-6"
              onClick={() => handleEliminarCuota(detalleCuota.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar cuota
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurrentFees;
