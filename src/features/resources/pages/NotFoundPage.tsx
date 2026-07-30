import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Button, Card } from '../../../design-system'

const Wrapper = styled(Card)`
  display: grid;
  justify-items: start;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
`

const Title = styled.h1`
  margin: 0;
`

const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.inkMuted};
`

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <Wrapper>
      <Title>Page not found</Title>
      <Description>
        The requested page does not exist or is no longer available.
      </Description>
      <Button type="button" onClick={() => navigate('/resources')}>
        Return to resources
      </Button>
    </Wrapper>
  )
}
