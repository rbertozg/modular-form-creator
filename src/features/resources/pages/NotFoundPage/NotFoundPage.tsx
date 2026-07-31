import { useNavigate } from 'react-router-dom'
import { Button } from '../../../../design-system'
import { Description, Title, Wrapper } from './NotFoundPage.styles'

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
