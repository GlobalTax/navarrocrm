import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ClientSelectorWithProspect } from '@/components/proposals/ClientSelectorWithProspect'
import { PricingTierManager } from './PricingTierManager'
import { proposalsLogger } from '@/utils/logging'
import { proposalSchema, type ProposalFormData, type ServiceItemFormData, type PricingTierFormData } from '../types/proposal.schema'

interface ProposalBuilderProps {
  onSave: (data: ProposalFormData) => void
  isSaving: boolean
}

export const ProposalBuilder: React.FC<ProposalBuilderProps> = ({ onSave, isSaving }) => {
  proposalsLogger.debug('ProposalBuilder renderizado', { isSaving })

  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      introduction: '',
      scopeOfWork: '',
      timeline: '',
      pricingTiers: [
        {
          name: 'Propuesta Principal',
          description: '',
          services: [
            {
              name: '',
              description: '',
              quantity: 1,
              unitPrice: 0,
              billingCycle: 'once'
            }
          ]
        }
      ]
    }
  })

  const watchedTiers = form.watch('pricingTiers')
  const selectedContactId = form.watch('contactId')

  const addPricingTier = () => {
    proposalsLogger.debug('Añadiendo nuevo tier de precios')
    const currentTiers = form.getValues('pricingTiers')
    const newTier: PricingTierFormData = {
      name: `Opción ${currentTiers.length + 1}`,
      description: '',
      services: [
        {
          name: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          billingCycle: 'once'
        }
      ]
    }

    try {
      form.setValue('pricingTiers', [...currentTiers, newTier], { shouldValidate: true })
      proposalsLogger.info('Tier añadido exitosamente')
    } catch (error) {
      proposalsLogger.error('Error añadiendo tier', { error })
    }
  }

  const removePricingTier = (index: number) => {
    proposalsLogger.debug('Eliminando tier de precios', { index })
    const currentTiers = form.getValues('pricingTiers')
    
    try {
      if (currentTiers.length > 1 && index >= 0 && index < currentTiers.length) {
        const updatedTiers = currentTiers.filter((_, i) => i !== index)
        form.setValue('pricingTiers', updatedTiers, { shouldValidate: true })
        proposalsLogger.info('Tier eliminado exitosamente')
      } else {
        proposalsLogger.warn('No se puede eliminar tier - índice inválido o tier insuficiente')
      }
    } catch (error) {
      proposalsLogger.error('Error eliminando tier', { error })
    }
  }

  const addService = (tierIndex: number) => {
    proposalsLogger.debug('Añadiendo servicio al tier', { tierIndex })
    const currentTiers = form.getValues('pricingTiers')
    
    try {
      if (tierIndex >= 0 && tierIndex < currentTiers.length) {
        const newService: ServiceItemFormData = {
          name: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          billingCycle: 'once'
        }

        const updatedTiers = [...currentTiers]
        updatedTiers[tierIndex] = {
          ...updatedTiers[tierIndex],
          services: [...updatedTiers[tierIndex].services, newService]
        }

        form.setValue('pricingTiers', updatedTiers, { shouldValidate: true })
        proposalsLogger.info('Servicio añadido exitosamente')
      }
    } catch (error) {
      proposalsLogger.error('Error añadiendo servicio', { error })
    }
  }

  const removeService = (tierIndex: number, serviceIndex: number) => {
    proposalsLogger.debug('Eliminando servicio', { tierIndex, serviceIndex })
    const currentTiers = form.getValues('pricingTiers')
    
    try {
      if (tierIndex >= 0 && tierIndex < currentTiers.length) {
        const currentServices = currentTiers[tierIndex].services
        if (currentServices.length > 1 && serviceIndex >= 0 && serviceIndex < currentServices.length) {
          const updatedTiers = [...currentTiers]
          updatedTiers[tierIndex] = {
            ...updatedTiers[tierIndex],
            services: currentServices.filter((_, i) => i !== serviceIndex)
          }
          form.setValue('pricingTiers', updatedTiers, { shouldValidate: true })
          proposalsLogger.info('Servicio eliminado exitosamente')
        } else {
          proposalsLogger.warn('No se puede eliminar servicio - servicios insuficientes o índice inválido')
        }
      }
    } catch (error) {
      proposalsLogger.error('Error eliminando servicio', { error })
    }
  }

  const calculateTierTotal = (tierIndex: number): number => {
    const currentTiers = form.getValues('pricingTiers')
    if (!currentTiers[tierIndex] || !currentTiers[tierIndex].services) {
      proposalsLogger.warn('No se encontró tier o servicios para el índice', { tierIndex })
      return 0
    }

    try {
      const services = currentTiers[tierIndex].services
      const total = services.reduce((sum, service) => {
        return sum + (service.quantity * service.unitPrice)
      }, 0)

      proposalsLogger.debug('Total del tier calculado', { tierIndex, total })
      return total
    } catch (error) {
      proposalsLogger.error('Error calculando total del tier', { error })
      return 0
    }
  }

  const onSubmit = (data: ProposalFormData) => {
    proposalsLogger.info('Enviando formulario de propuesta', { data })
    
    try {
      // Calcular totales finales para cada tier
      data.pricingTiers.forEach((tier, index) => {
        const total = calculateTierTotal(index)
        proposalsLogger.debug('Total final del tier', { index, total })
      })

      proposalsLogger.info('Datos finales de propuesta', { data })
      onSave(data)
    } catch (error) {
      proposalsLogger.error('Error en envío del formulario', { error })
    }
  }

  proposalsLogger.debug('Tiers de precios actuales', { count: watchedTiers.length })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Nueva Propuesta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label htmlFor="contactId">Cliente *</Label>
            <ClientSelectorWithProspect
              selectedClientId={selectedContactId}
              onClientSelected={(clientId) => form.setValue('contactId', clientId, { shouldValidate: true })}
            />
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título de la Propuesta *</Label>
              <Input
                id="title"
                {...form.register('title')}
                placeholder="Ej: Asesoría Legal Empresarial"
              />
              {form.formState.errors.title && (
                <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="introduction">Introducción</Label>
              <Textarea
                id="introduction"
                {...form.register('introduction')}
                placeholder="Introducción a la propuesta..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scopeOfWork">Alcance del Trabajo</Label>
              <Textarea
                id="scopeOfWork"
                {...form.register('scopeOfWork')}
                placeholder="Descripción detallada del alcance..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeline">Cronograma</Label>
              <Textarea
                id="timeline"
                {...form.register('timeline')}
                placeholder="Cronograma estimado del proyecto..."
                rows={3}
              />
            </div>
          </div>

          {/* Pricing Tiers */}
          <PricingTierManager
            form={form}
            pricingTiers={watchedTiers}
            onAddTier={addPricingTier}
            onRemoveTier={removePricingTier}
            onAddService={addService}
            onRemoveService={removeService}
            onCalculateTotal={calculateTierTotal}
          />

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving || !selectedContactId}
            >
              {isSaving ? 'Guardando...' : 'Guardar Propuesta'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}