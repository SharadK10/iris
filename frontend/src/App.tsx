import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Shell from './components/Shell'
import Home from './pages/Home'
import EchoPage from './pages/EchoPage'

export default function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/echo/:code" element={<EchoPage />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  )
}
