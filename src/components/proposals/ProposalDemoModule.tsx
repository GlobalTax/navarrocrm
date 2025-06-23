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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useServiceCatalog } from "@/hooks/useServiceCatalog";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Service = {
  id: string;
  nombre: string;
  descripcion: string;
  cantidad: number;
  precio: number;
  iva: number;
  descuento: number;
};

function calcularTotales(servicios: Service[]) {
  let base = 0;
  let totalIVA = 0;
  let totalDescuento = 0;
  servicios.forEach((s) => {
    const subtotal = s.cantidad * s.precio;
    const descuento = (subtotal * s.descuento) / 100;
    const baseTrasDescuento = subtotal - descuento;
    const iva = (baseTrasDescuento * s.iva) / 100;
    base += baseTrasDescuento;
    totalIVA += iva;
    totalDescuento += descuento;
  });
  return {
    base: base,
    iva: totalIVA,
    descuento: totalDescuento,
    total: base + totalIVA,
  };
}

interface ProposalDemoModuleProps {
  onBack: () => void;
}

export default function ProposalDemoModule({ onBack }: ProposalDemoModuleProps) {
  const { clients } = useClients();
  const { services } = useServiceCatalog();
  const { user } = useApp();
  
  const [servicios, setServicios] = useState<Service[]>([
    {
      id: crypto.randomUUID(),
      nombre: "",
      descripcion: "",
      cantidad: 1,
      precio: 0,
      iva: 21,
      descuento: 0,
    },
  ]);
  const [clienteId, setClienteId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [notas, setNotas] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const totales = calcularTotales(servicios);
  const selectedClient = clients.find(c => c.id === clienteId);

  function actualizarServicio(id: string, campo: keyof Service, valor: any) {
    setServicios((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, [campo]: valor } : s
      )
    );
  }

  function agregarServicio() {
    setServicios((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        nombre: "",
        descripcion: "",
        cantidad: 1,
        precio: 0,
        iva: 21,
        descuento: 0,
      },
    ]);
  }

  function eliminarServicio(id: string) {
    setServicios((prev) => prev.filter((s) => s.id !== id));
  }

  function seleccionarServicioCatalogo(servicioId: string, targetServiceId: string) {
    const servicioCatalogo = services.find(s => s.id === servicioId);
    if (servicioCatalogo) {
      actualizarServicio(targetServiceId, "nombre", servicioCatalogo.name);
      actualizarServicio(targetServiceId, "descripcion", servicioCatalogo.description || "");
      actualizarServicio(targetServiceId, "precio", servicioCatalogo.default_price || 0);
    }
  }

  async function guardarPropuesta() {
    if (!user?.org_id || !clienteId || !titulo) return;

    setIsSaving(true);
    try {
      // Crear la propuesta
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .insert({
          org_id: user.org_id,
          client_id: clienteId,
          title: titulo,
          description: notas,
          total_amount: totales.total,
          currency: 'EUR',
          proposal_type: 'service',
          status: 'draft',
          created_by: user.id
        })
        .select()
        .single();

      if (proposalError) throw proposalError;

      // Crear los line items
      const lineItems = servicios
        .filter(s => s.nombre && s.precio > 0)
        .map((s, index) => ({
          proposal_id: proposal.id,
          name: s.nombre,
          description: s.descripcion,
          quantity: s.cantidad,
          unit_price: s.precio,
          total_price: s.cantidad * s.precio * (1 - s.descuento / 100) * (1 + s.iva / 100),
          billing_unit: 'servicio',
          sort_order: index
        }));

      if (lineItems.length > 0) {
        const { error: lineItemsError } = await supabase
          .from('proposal_line_items')
          .insert(lineItems);

        if (lineItemsError) throw lineItemsError;
      }

      toast.success(`La propuesta "${titulo}" ha sido guardada como borrador.`);

      onBack();
    } catch (error: any) {
      console.error('Error guardando propuesta:', error);
      toast.error(error.message || "Ha ocurrido un error inesperado");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Propuestas
        </Button>
        <h1 className="text-2xl font-bold">Propuesta Profesional</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crear Propuesta Profesional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="titulo">Título de la propuesta</Label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Propuesta de servicios jurídicos"
                className="mb-4"
              />
              
              <Label htmlFor="cliente">Cliente</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger className="mb-4">
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Label htmlFor="notas">Notas adicionales</Label>
              <Textarea
                id="notas"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Condiciones, observaciones, etc."
                className="mb-4"
              />
            </div>
            <div>
              <Label>Servicios</Label>
              <ScrollArea className="h-72 pr-2">
                {servicios.map((servicio, idx) => (
                  <Card
                    key={servicio.id}
                    className="mb-4 border-2 border-muted relative"
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => eliminarServicio(servicio.id)}
                      disabled={servicios.length === 1}
                      title="Eliminar servicio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <CardContent className="pt-4 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={servicio.nombre}
                          onChange={(e) =>
                            actualizarServicio(servicio.id, "nombre", e.target.value)
                          }
                          placeholder={`Nombre del servicio #${idx + 1}`}
                          className="font-semibold flex-1"
                        />
                        <Select onValueChange={(value) => seleccionarServicioCatalogo(value, servicio.id)}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Catálogo" />
                          </SelectTrigger>
                          <SelectContent>
                            {services.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Textarea
                        value={servicio.descripcion}
                        onChange={(e) =>
                          actualizarServicio(servicio.id, "descripcion", e.target.value)
                        }
                        placeholder="Descripción detallada"
                        rows={2}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          min={1}
                          value={servicio.cantidad}
                          onChange={(e) =>
                            actualizarServicio(
                              servicio.id,
                              "cantidad",
                              Number(e.target.value)
                            )
                          }
                          placeholder="Cantidad"
                        />
                        <Input
                          type="number"
                          min={0}
                          value={servicio.precio}
                          onChange={(e) =>
                            actualizarServicio(
                              servicio.id,
                              "precio",
                              Number(e.target.value)
                            )
                          }
                          placeholder="Precio unitario (€)"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={servicio.iva}
                          onChange={(e) =>
                            actualizarServicio(
                              servicio.id,
                              "iva",
                              Number(e.target.value)
                            )
                          }
                          placeholder="IVA (%)"
                        />
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={servicio.descuento}
                          onChange={(e) =>
                            actualizarServicio(
                              servicio.id,
                              "descuento",
                              Number(e.target.value)
                            )
                          }
                          placeholder="Descuento (%)"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={agregarServicio}
                  type="button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir servicio
                </Button>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-end gap-2">
          <div className="w-full md:w-1/2">
            <div className="flex justify-between py-1">
              <span>Base imponible</span>
              <span>{totales.base.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Descuento total</span>
              <span>-{totales.descuento.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between py-1">
              <span>IVA total</span>
              <span>{totales.iva.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between py-2 font-bold border-t mt-2">
              <span>Total</span>
              <span>{totales.total.toFixed(2)} €</span>
            </div>
          </div>
          <Button 
            className="mt-4" 
            disabled={!clienteId || !titulo || servicios.some(s => !s.nombre || s.precio <= 0) || isSaving}
            onClick={guardarPropuesta}
          >
            {isSaving ? (
              <>
                <Save className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar propuesta
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Vista previa profesional */}
      <div className="mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Vista previa de la propuesta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2 text-2xl font-bold">{titulo || "Título de la propuesta"}</div>
            <div className="mb-1 text-muted-foreground">
              Cliente: <span className="font-semibold">{selectedClient?.name || "Seleccionar cliente"}</span>
            </div>
            <div className="mb-4 text-sm text-muted-foreground">{notas}</div>
            <table className="w-full border mt-4">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left">Servicio</th>
                  <th className="p-2 text-right">Cantidad</th>
                  <th className="p-2 text-right">Precio</th>
                  <th className="p-2 text-right">Descuento</th>
                  <th className="p-2 text-right">IVA</th>
                  <th className="p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {servicios.map((s, i) => {
                  const subtotal = s.cantidad * s.precio;
                  const descuento = (subtotal * s.descuento) / 100;
                  const baseTrasDescuento = subtotal - descuento;
                  const iva = (baseTrasDescuento * s.iva) / 100;
                  const total = baseTrasDescuento + iva;
                  return (
                    <tr key={s.id} className="border-t">
                      <td className="p-2">
                        <div className="font-semibold">{s.nombre || <span className="text-muted-foreground">Servicio #{i + 1}</span>}</div>
                        <div className="text-xs text-muted-foreground">{s.descripcion}</div>
                      </td>
                      <td className="p-2 text-right">{s.cantidad}</td>
                      <td className="p-2 text-right">{s.precio.toFixed(2)} €</td>
                      <td className="p-2 text-right">-{descuento.toFixed(2)} €</td>
                      <td className="p-2 text-right">{iva.toFixed(2)} €</td>
                      <td className="p-2 text-right font-bold">{total.toFixed(2)} €</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t font-bold">
                  <td className="p-2 text-right" colSpan={5}>Total</td>
                  <td className="p-2 text-right">{totales.total.toFixed(2)} €</td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
