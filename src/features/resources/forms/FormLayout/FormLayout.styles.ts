import styled from 'styled-components'

export const Form = styled.form`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
`

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`

export const FullWidthField = styled.div`
  grid-column: 1 / -1;
`

export const InteractiveCheckboxField = styled.div`
  input[type='checkbox'] {
    inset: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
    margin: 0;
    cursor: pointer;
  }

  input[type='checkbox']:disabled {
    cursor: not-allowed;
  }

  label {
    cursor: pointer;
  }
`

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
`
