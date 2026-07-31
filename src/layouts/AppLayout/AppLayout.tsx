import { Outlet } from 'react-router-dom'
import { Brand, Header, HeaderContent, Main, Shell } from './AppLayout.styles'

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
