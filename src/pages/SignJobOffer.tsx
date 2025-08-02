import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, CheckCircle, AlertCircle, FileSignature } from 'lucide-react';

interface SignatureData {
  id: string;
  candidate_name: string;
  candidate_email: string;
  status: string;
  expires_at: string;
  job_offer_id: string;
}

export function SignJobOffer() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [signatureData, setSignatureData] = useState<SignatureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    if (token) {
      fetchSignatureData();
    }
  }, [token]);

  const fetchSignatureData = async () => {
    try {
      const { data, error } = await supabase
        .from('job_offer_signatures')
        .select('*')
        .eq('signature_token', token)
        .single();

      if (error || !data) {
        toast.error("El enlace de firma no es válido o ha expirado.");
        return;
      }

      if (data.status === 'signed') {
        setSigned(true);
      }

      if (new Date(data.expires_at) < new Date()) {
        toast.error("Este enlace de firma ha expirado.");
        return;
      }

      setSignatureData(data);
    } catch (error) {
      console.error('Error fetching signature data:', error);
      toast.error("Error al cargar los datos de la firma.");
    } finally {
      setLoading(false);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasSignature(false);
  };

  const submitSignature = async () => {
    if (!hasSignature || !signatureData) {
      toast.error("Por favor, firme en el área designada antes de continuar.");
      return;
    }

    setSigning(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const signatureDataUrl = canvas.toDataURL();

      const { data, error } = await supabase.functions.invoke('process-signature', {
        body: {
          token,
          signatureData: signatureDataUrl,
          ipAddress: await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => d.ip).catch(() => null),
          userAgent: navigator.userAgent
        }
      });

      if (error) throw error;

      setSigned(true);
      toast.success("La oferta de trabajo ha sido firmada exitosamente.");

    } catch (error) {
      console.error('Error submitting signature:', error);
      toast.error("Error al procesar la firma. Inténtelo de nuevo.");
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Cargando...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
            <CardTitle className="text-success">¡Firma Completada!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              La oferta de trabajo ha sido firmada exitosamente.
            </p>
            <p className="text-sm text-muted-foreground">
              Recibirá una confirmación por correo electrónico en breve.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!signatureData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-destructive">Enlace no válido</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              El enlace de firma no es válido o ha expirado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <FileSignature className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Firma de Oferta de Trabajo</CardTitle>
            <p className="text-muted-foreground">
              {signatureData.candidate_name}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">Instrucciones:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Firme en el área designada usando su ratón o dedo</li>
                <li>• Puede borrar y volver a firmar si es necesario</li>
                <li>• Una vez firmado, no podrá modificar la firma</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-4">
                <label className="block text-sm font-medium mb-2">
                  Área de Firma:
                </label>
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={200}
                  className="border border-border rounded bg-white cursor-crosshair w-full"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  style={{ touchAction: 'none' }}
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={clearSignature}
                  disabled={!hasSignature}
                  className="flex-1"
                >
                  Limpiar Firma
                </Button>
                <Button
                  onClick={submitSignature}
                  disabled={!hasSignature || signing}
                  className="flex-1"
                >
                  {signing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Firmar Oferta
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Este enlace expira el {new Date(signatureData.expires_at).toLocaleDateString('es-ES')}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}