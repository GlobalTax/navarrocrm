import React from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { COURSE_LEVELS } from '@/types/academy'

export type CourseFiltersState = {
  search: string
  status: 'all' | 'published' | 'draft'
  categoryId: 'all' | string
  level: 'all' | 'beginner' | 'intermediate' | 'advanced'
}

interface CategoryOption {
  id: string
  name: string
  color?: string
}

interface CourseFiltersProps {
  filters: CourseFiltersState
  categories: CategoryOption[]
  onChange: (next: CourseFiltersState) => void
  onReset?: () => void
}

export function CourseFilters({ filters, categories, onChange, onReset }: CourseFiltersProps) {
  const set = (patch: Partial<CourseFiltersState>) => onChange({ ...filters, ...patch })

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Input
          placeholder="Buscar por título o descripción"
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
          className="border-0.5 border-black rounded-[10px]"
        />

        <Select
          value={filters.status}
          onValueChange={(v: CourseFiltersState['status']) => set({ status: v })}
        >
          <SelectTrigger className="border-0.5 border-black rounded-[10px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="published">Publicados</SelectItem>
            <SelectItem value="draft">Borradores</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.categoryId}
          onValueChange={(v: CourseFiltersState['categoryId']) => set({ categoryId: v })}
        >
          <SelectTrigger className="border-0.5 border-black rounded-[10px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.level}
          onValueChange={(v: CourseFiltersState['level']) => set({ level: v })}
        >
          <SelectTrigger className="border-0.5 border-black rounded-[10px]">
            <SelectValue placeholder="Nivel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los niveles</SelectItem>
            <SelectItem value="beginner">{COURSE_LEVELS.beginner}</SelectItem>
            <SelectItem value="intermediate">{COURSE_LEVELS.intermediate}</SelectItem>
            <SelectItem value="advanced">{COURSE_LEVELS.advanced}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={onReset ?? (() => onChange({ search: '', status: 'all', categoryId: 'all', level: 'all' }))}
          className="border-0.5 border-black rounded-[10px]"
        >
          Limpiar filtros
        </Button>
      </div>
    </div>
  )
}
