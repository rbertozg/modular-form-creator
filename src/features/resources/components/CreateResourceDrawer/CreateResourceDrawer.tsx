import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Drawer, Input } from '../../../../design-system'
import { getErrorMessage } from '../../../../api/api-error'
import { AlertMessage } from '../../../../components/AlertMessage/AlertMessage'
import {
  createResourceSchema,
  type CreateResourceFormValues,
} from '../../domain/resource.schemas'
import { Actions, Form } from './CreateResourceDrawer.styles'

interface CreateResourceDrawerProps {
  isOpen: boolean
  isPending: boolean
  error: unknown
  onClose: () => void
  onSubmit: (resourceName: string) => void
}

export function CreateResourceDrawer({
  isOpen,
  isPending,
  error,
  onClose,
  onSubmit,
}: CreateResourceDrawerProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateResourceFormValues>({
    resolver: zodResolver(createResourceSchema),
    defaultValues: { resourceName: '' },
  })

  useEffect(() => {
    if (!isOpen) {
      reset()
    }
  }, [isOpen, reset])

  return (
    <Drawer title="Create resource" isOpen={isOpen} onClose={onClose}>
      <Form
        noValidate
        onSubmit={handleSubmit(({ resourceName }) => onSubmit(resourceName))}
      >
        <Input
          label="Resource name"
          placeholder="For example: Customer onboarding"
          autoComplete="off"
          disabled={isPending}
          error={errors.resourceName?.message}
          {...register('resourceName')}
        />
        {error ? (
          <AlertMessage tone="error">{getErrorMessage(error)}</AlertMessage>
        ) : null}
        <Actions>
          <Button
            type="button"
            variant="secondary"
            disabled={isPending}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Creating…' : 'Create resource'}
          </Button>
        </Actions>
      </Form>
    </Drawer>
  )
}
