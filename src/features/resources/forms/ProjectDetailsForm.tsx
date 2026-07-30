import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { CheckboxGroup, Input, Select } from '../../../design-system'
import { TEAM_MEMBERS, type ProjectDetails } from '../api/resources.types'
import { UnsavedFormGuard } from '../components/UnsavedFormGuard'
import { useUnsavedFormGuard } from '../hooks/useUnsavedFormGuard'
import {
  projectDetailsSchema,
  type ProjectDetailsFormInput,
  type ProjectDetailsFormValues,
} from '../resource.schemas'
import { FormActions, FormError } from './FormLayout'
import { Form, FormGrid, InteractiveCheckboxField } from './FormLayout.styles'

interface ProjectDetailsFormProps {
  defaultValues: ProjectDetails
  isPending: boolean
  error: unknown
  submitLabel: string
  onCancel: () => void
  onSubmit: (values: ProjectDetails) => Promise<void>
  onSubmitSuccess: () => void
}

export function ProjectDetailsForm({
  defaultValues,
  isPending,
  error,
  submitLabel,
  onCancel,
  onSubmit,
  onSubmitSuccess,
}: ProjectDetailsFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProjectDetailsFormInput, unknown, ProjectDetailsFormValues>({
    resolver: zodResolver(projectDetailsSchema),
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
            label="Project name"
            disabled={isBusy}
            error={errors.projectName?.message}
            {...register('projectName')}
          />
          <Input
            label="Budget"
            inputMode="numeric"
            disabled={isBusy}
            error={errors.budget?.message}
            {...register('budget')}
          />
          <Select
            label="Category"
            disabled={isBusy}
            error={errors.category?.message}
            options={[
              { value: '', label: 'Select category' },
              { value: 'internal', label: 'Internal' },
              { value: 'external', label: 'External' },
              { value: 'vendor', label: 'Vendor' },
            ]}
            {...register('category')}
          />
          <InteractiveCheckboxField>
            <Controller
              name="options"
              control={control}
              render={({ field, fieldState }) => (
                <CheckboxGroup
                  label="Team members"
                  options={[...TEAM_MEMBERS]}
                  value={field.value ?? []}
                  disabled={isBusy}
                  error={fieldState.error?.message}
                  onChange={field.onChange}
                />
              )}
            />
          </InteractiveCheckboxField>
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
