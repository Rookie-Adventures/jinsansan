import { render, screen } from '@/test/utils'

import Loading from '../Loading'

describe('Loading Component', () => {
  it('renders loading indicator', () => {
    render(<Loading />)
    const loadingElement = screen.getByRole('progressbar')
    expect(loadingElement).toBeInTheDocument()
  })

  it('renders with custom size', () => {
    render(<Loading size={40} />)
    const loadingElement = screen.getByRole('progressbar')
    expect(loadingElement).toHaveStyle({ width: '40px', height: '40px' })
  })
}) 