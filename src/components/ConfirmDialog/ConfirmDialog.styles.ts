import styled from 'styled-components'

export const Dialog = styled.dialog`
  width: min(440px, calc(100vw - 32px));
  padding: 0;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.inkStrong};
  box-shadow: ${({ theme }) => theme.shadows.raised};

  &::backdrop {
    background: rgba(18, 33, 43, 0.56);
  }
`

export const Content = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
`

export const Title = styled.h2`
  margin: 0;
`

export const Message = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.inkMuted};
`

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
`
