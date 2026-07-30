import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Input, Select } from '../../../design-system'
import type { BasicInfo } from '../api/resources.types'
import { UnsavedFormGuard } from '../components/UnsavedFormGuard'
import { useUnsavedFormGuard } from '../hooks/useUnsavedFormGuard'
import {
  basicInfoSchema,
  type BasicInfoFormInput,
  type BasicInfoFormValues,
} from '../resource.schemas'
import { FormActions, FormError } from './FormLayout'
import { Form, FormGrid, FullWidthField } from './FormLayout.styles'

interface BasicInfoFormProps {
  defaultValues: BasicInfo
  isPending: boolean
  error: unknown
  submitLabel: string
  onCancel: () => void
  onSubmit: (values: BasicInfo) => Promise<void>
  onSubmitSuccess: () => void
}

export function BasicInfoForm({
  defaultValues,
  isPending,
  error,
  submitLabel,
  onCancel,
  onSubmit,
  onSubmitSuccess,
}: BasicInfoFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<BasicInfoFormInput, unknown, BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues,
  })
  const navigationGuard = useUnsavedFormGuard(isDirty)
  const isBusy = isPending || isSubmitting

  useEffect(() => reset(defaultValues), [defaultValues, reset])

  const submitForm = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch {
      return
    }

    reset(values)
    navigationGuard.navigateWithoutBlocking(onSubmitSuccess)
  })

  return (
    <>
      <Form noValidate onSubmit={submitForm}>
        <FormGrid>
          <Input
            label="Resource name"
            state="locked"
            readOnly
            tooltip="Resource name cannot be changed after creation."
            error={errors.resourceName?.message}
            {...register('resourceName')}
          />
          <Input
            label="Owner"
            autoComplete="name"
            disabled={isBusy}
            error={errors.owner?.message}
            {...register('owner')}
          />
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            disabled={isBusy}
            error={errors.email?.message}
            {...register('email')}
          />
          <Select
            label="Priority"
            disabled={isBusy}
            error={errors.priority?.message}
            options={[
              { value: '', label: 'Select priority' },
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
            {...register('priority')}
          />
          <FullWidthField>
            <Input
              label="Description"
              multiline
              rows={5}
              disabled={isBusy}
              error={errors.description?.message}
              {...register('description')}
            />
          </FullWidthField>
        </FormGrid>
        <FormError error={error} />
        <FormActions isPending={isBusy} submitLabel={submitLabel} onCancel={onCancel} />
      </Form>
      <UnsavedFormGuard
        isDirty={isDirty}
        isNavigationBlocked={navigationGuard.isNavigationBlocked}
        isSubmissionPending={isBusy}
        onCancelNavigation={navigationGuard.cancelNavigation}
        onConfirmNavigation={navigationGuard.confirmNavigation}
      />
    </>
  )
}
