import { Link, Outlet } from 'react-router-dom'
import styled from 'styled-components'

const Shell = styled.div`
  min-height: 100svh;
  background: ${({ theme }) => theme.colors.surfaceAlt};
`

const Header = styled.header`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`

const HeaderContent = styled.div`
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.md} 0;
`

const Brand = styled(Link)`
  color: ${({ theme }) => theme.colors.inkStrong};
  font-family: ${({ theme }) => theme.typography.heading};
  font-size: 1.25rem;
  font-weight: 700;
  text-decoration: none;
`

const Main = styled.main`
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl} 0 ${({ theme }) => theme.spacing.xxl};
`

export function AppLayout() {
  return (
    <Shell>
      <Header>
        <HeaderContent>
          <Brand to="/resources">Resources Management</Brand>
        </HeaderContent>
      </Header>
      <Main>
        <Outlet />
      </Main>
    </Shell>
  )
}
