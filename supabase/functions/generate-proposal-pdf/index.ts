import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateProposalPdfRequest {
  proposalId: string;
  totalAmount: number;
  currency?: string;
  lineItems: any[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { proposalId, totalAmount, currency = 'EUR', lineItems }: GenerateProposalPdfRequest = await req.json();

    if (!proposalId) {
      return new Response(JSON.stringify({ error: 'proposalId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Obtener información completa de la propuesta
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select(`
        *,
        contact:contacts!proposals_contact_id_fkey(
          id,
          name,
          email,
          phone,
          dni_nif
        )
      `)
      .eq('id', proposalId)
      .single();

    if (proposalError || !proposal) {
      return new Response(JSON.stringify({ error: 'Propuesta no encontrada' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calcular totales
    const subtotal = lineItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
    const taxRate = 0.21; // 21% IVA
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    // Generar HTML para el PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Propuesta ${proposal.proposal_number}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Arial', sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background: white;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px 30px; 
        }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #0061FF; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
        }
        .company-name { 
            font-size: 24px; 
            font-weight: bold; 
            color: #0061FF; 
            margin-bottom: 5px; 
        }
        .proposal-number { 
            font-size: 14px; 
            color: #666; 
            background: #f8f9fa; 
            padding: 5px 15px; 
            border-radius: 20px; 
            display: inline-block; 
        }
        .section { 
            margin-bottom: 25px; 
        }
        .section-title { 
            font-size: 18px; 
            font-weight: bold; 
            color: #0061FF; 
            margin-bottom: 10px; 
            border-left: 4px solid #0061FF; 
            padding-left: 10px; 
        }
        .client-info { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 8px; 
            border-left: 4px solid #0061FF; 
        }
        .client-name { 
            font-weight: bold; 
            font-size: 16px; 
            margin-bottom: 5px; 
        }
        .table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0; 
            background: white; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
        }
        .table th, .table td { 
            padding: 12px; 
            text-align: left; 
            border-bottom: 1px solid #e9ecef; 
        }
        .table th { 
            background: #0061FF; 
            color: white; 
            font-weight: bold; 
        }
        .table tr:hover { 
            background: #f8f9fa; 
        }
        .text-right { 
            text-align: right; 
        }
        .totals-section { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            border: 1px solid #e9ecef; 
        }
        .total-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 8px; 
            padding: 5px 0; 
        }
        .total-row.final { 
            border-top: 2px solid #0061FF; 
            padding-top: 10px; 
            font-weight: bold; 
            font-size: 18px; 
            color: #0061FF; 
        }
        .description { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 15px 0; 
            line-height: 1.8; 
        }
        .terms { 
            font-size: 12px; 
            color: #666; 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #e9ecef; 
        }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #e9ecef; 
            color: #666; 
            font-size: 12px; 
        }
        .valid-until { 
            background: #fff3cd; 
            color: #856404; 
            padding: 10px; 
            border-radius: 5px; 
            border: 1px solid #ffeaa7; 
            margin: 15px 0; 
            text-align: center; 
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="company-name">DESPACHO JURÍDICO</div>
            <div class="proposal-number">Propuesta Nº ${proposal.proposal_number}</div>
        </div>

        <!-- Client Information -->
        <div class="section">
            <div class="section-title">Información del Cliente</div>
            <div class="client-info">
                <div class="client-name">${proposal.contact?.name || 'Cliente'}</div>
                ${proposal.contact?.dni_nif ? `<div>NIF/CIF: ${proposal.contact.dni_nif}</div>` : ''}
                ${proposal.contact?.email ? `<div>Email: ${proposal.contact.email}</div>` : ''}
                ${proposal.contact?.phone ? `<div>Teléfono: ${proposal.contact.phone}</div>` : ''}
            </div>
        </div>

        <!-- Proposal Title and Description -->
        <div class="section">
            <div class="section-title">Propuesta: ${proposal.title}</div>
            ${proposal.description ? `<div class="description">${proposal.description}</div>` : ''}
        </div>

        <!-- Services Table -->
        <div class="section">
            <div class="section-title">Servicios Propuestos</div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Concepto</th>
                        <th>Descripción</th>
                        <th>Cant.</th>
                        <th>Precio Unit.</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${lineItems.map(item => `
                        <tr>
                            <td><strong>${item.name}</strong></td>
                            <td>${item.description || ''}</td>
                            <td class="text-right">${item.quantity} ${item.billing_unit || ''}</td>
                            <td class="text-right">${item.unit_price?.toFixed(2)} €</td>
                            <td class="text-right"><strong>${item.total_price?.toFixed(2)} €</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- Totals -->
        <div class="section">
            <div class="totals-section">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)} €</span>
                </div>
                <div class="total-row">
                    <span>IVA (21%):</span>
                    <span>${taxAmount.toFixed(2)} €</span>
                </div>
                <div class="total-row final">
                    <span>TOTAL:</span>
                    <span>${total.toFixed(2)} €</span>
                </div>
            </div>
        </div>

        <!-- Validity -->
        ${proposal.valid_until ? `
            <div class="valid-until">
                <strong>Propuesta válida hasta:</strong> ${new Date(proposal.valid_until).toLocaleDateString('es-ES')}
            </div>
        ` : ''}

        <!-- Terms and Conditions -->
        ${proposal.scope_of_work ? `
            <div class="section">
                <div class="section-title">Términos y Condiciones</div>
                <div class="description">${proposal.scope_of_work}</div>
            </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
            <div>Esta propuesta ha sido generada automáticamente</div>
            <div>Fecha de generación: ${new Date().toLocaleDateString('es-ES')}</div>
        </div>
    </div>
</body>
</html>`;

    // Crear un blob HTML (por ahora devolvemos HTML, en producción se usaría Puppeteer para PDF real)
    const htmlBlob = new Blob([htmlContent], { type: 'text/html; charset=utf-8' });
    
    return new Response(htmlBlob, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="propuesta-${proposal.proposal_number}.html"`,
      },
    });

  } catch (error) {
    console.error('Error generating proposal PDF:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);