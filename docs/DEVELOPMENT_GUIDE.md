# Guía de Desarrollo

## Configuración del Entorno

### Requisitos Previos
- Node.js 18+
- npm o yarn
- Cuenta de Supabase
- Git

### Instalación Local
```bash
# Clonar el repositorio
git clone <repository-url>
cd legal-crm

# Instalar dependencias
npm install

# Configurar variables de entorno (archivo .env.local)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Iniciar servidor de desarrollo
npm run dev
```

### Configuración de Supabase
```bash
# Instalar CLI de Supabase
npm install -g supabase

# Inicializar proyecto
supabase init

# Enlazar con proyecto remoto
supabase link --project-ref your-project-id

# Ejecutar migraciones
supabase db push
```

## Estándares de Código

### Estructura de Componentes
```typescript
// components/example/ExampleComponent.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useExampleData } from '@/hooks/use-example-data';

interface ExampleComponentProps {
  id: string;
  variant?: 'default' | 'secondary';
  onAction?: (id: string) => void;
}

export function ExampleComponent({ 
  id, 
  variant = 'default', 
  onAction 
}: ExampleComponentProps) {
  const { data, isLoading, error } = useExampleData(id);
  
  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div className="p-4 border border-border rounded-lg">
      <h3 className="text-lg font-semibold text-foreground">
        {data?.title}
      </h3>
      <Button 
        variant={variant} 
        onClick={() => onAction?.(id)}
      >
        Acción
      </Button>
    </div>
  );
}
```

### Custom Hooks
```typescript
// hooks/use-example-data.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useExampleData(id: string) {
  return useQuery({
    queryKey: ['example-data', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('example_table')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
}

export function useCreateExample() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ExampleCreateData) => {
      const { data: result, error } = await supabase
        .from('example_table')
        .insert(data)
        .select()
        .single();
        
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['example-data'] });
    }
  });
}
```

### Manejo de Formularios
```typescript
// components/forms/ExampleForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  description: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

interface ExampleFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: Partial<FormData>;
}

export function ExampleForm({ onSubmit, initialData }: ExampleFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </form>
    </Form>
  );
}
```

## Sistema de Diseño

### Tokens de Color
```css
/* src/index.css - Variables CSS personalizadas */
:root {
  /* Colores principales */
  --primary: 216 100% 50%;           /* #0061FF - Azul corporativo */
  --primary-foreground: 0 0% 100%;   /* Texto sobre primary */
  
  /* Colores de estado */
  --success: 142 69% 58%;            /* #2CBD6E - Verde éxito */
  --warning: 32 95% 44%;             /* #E09112 - Naranja advertencia */
  --destructive: 0 84% 60%;          /* #EF4444 - Rojo error */
  
  /* Colores neutros */
  --background: 0 0% 100%;           /* Fondo principal */
  --foreground: 224 71% 4%;          /* Texto principal */
  --muted: 220 14% 96%;              /* Fondos secundarios */
  --border: 220 13% 91%;             /* Bordes */
}

[data-theme="dark"] {
  --background: 224 71% 4%;
  --foreground: 213 31% 91%;
  /* ... más variables para tema oscuro */
}
```

### Componentes Base
```typescript
// Usar siempre clases semánticas, no colores directos
<div className="bg-background text-foreground border border-border">
  <h1 className="text-primary">Título</h1>
  <p className="text-muted-foreground">Descripción</p>
</div>

// ❌ Evitar colores directos
<div className="bg-white text-black border-gray-200">

// ✅ Usar tokens semánticos
<div className="bg-background text-foreground border-border">
```

### Variantes de Componentes
```typescript
// lib/utils.ts - Definir variantes con cva
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-border bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
```

## Pruebas

### Pruebas Unitarias con Vitest
```typescript
// components/__tests__/ExampleComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ExampleComponent } from '../ExampleComponent';

const mockOnAction = vi.fn();

describe('ExampleComponent', () => {
  it('renders correctly', () => {
    render(
      <ExampleComponent 
        id="test-id" 
        onAction={mockOnAction} 
      />
    );
    
    expect(screen.getByText('Título')).toBeInTheDocument();
  });

  it('calls onAction when button is clicked', () => {
    render(
      <ExampleComponent 
        id="test-id" 
        onAction={mockOnAction} 
      />
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnAction).toHaveBeenCalledWith('test-id');
  });
});
```

### Pruebas de Integración
```typescript
// hooks/__tests__/use-example-data.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useExampleData } from '../use-example-data';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useExampleData', () => {
  it('fetches data successfully', async () => {
    const { result } = renderHook(
      () => useExampleData('test-id'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });
});
```

## Edge Functions

### Estructura Básica
```typescript
// supabase/functions/example-function/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Manejar CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Configurar cliente Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar autenticación
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    // Obtener usuario
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    // Lógica de la función
    const body = await req.json();
    const result = await processRequest(body, user.id);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});

async function processRequest(body: any, userId: string) {
  // Implementar lógica específica
  return { success: true, data: body };
}
```

### Logging y Debugging
```typescript
// Logging estructurado
console.log(JSON.stringify({
  level: 'info',
  message: 'Processing request',
  userId,
  timestamp: new Date().toISOString(),
  metadata: { requestId: 'req-123' }
}));

// Error handling
try {
  // Operación que puede fallar
} catch (error) {
  console.error(JSON.stringify({
    level: 'error',
    message: 'Operation failed',
    error: error.message,
    stack: error.stack,
    userId,
    timestamp: new Date().toISOString()
  }));
  
  throw error;
}
```

## Debugging

### React Query DevTools
```typescript
// main.tsx - Solo en desarrollo
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Rutas */}
        </Routes>
      </Router>
      {import.meta.env.DEV && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}
```

### Console Logs Estructurados
```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      data,
      timestamp: new Date().toISOString()
    }));
  },
  
  error: (message: string, error?: Error, data?: any) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.message,
      stack: error?.stack,
      data,
      timestamp: new Date().toISOString()
    }));
  }
};
```

### Error Boundaries
```typescript
// components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-destructive rounded-lg">
          <h2>Algo salió mal</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Performance

### Code Splitting
```typescript
// pages/LazyPage.tsx
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('../components/HeavyComponent'));

export function LazyPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

### Optimización de Re-renders
```typescript
// hooks/use-optimized-data.ts
import { useMemo, useCallback } from 'react';

export function useOptimizedData(data: any[]) {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      computed: expensiveComputation(item)
    }));
  }, [data]);

  const handleAction = useCallback((id: string) => {
    // Acción optimizada
  }, []);

  return { processedData, handleAction };
}
```

## Deployment

### Configuración de Build
```json
// package.json
{
  "scripts": {
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

### Variables de Entorno
```bash
# .env.production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### CI/CD con GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
      
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```