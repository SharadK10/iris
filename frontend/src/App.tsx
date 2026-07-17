import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Shell from './components/Shell'
import Home from './pages/Home'
import EchoPage from './pages/EchoPage'
import WriteLetter from './pages/WriteLetter'
import LetterPage from './pages/LetterPage'

export default function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/echo/:code" element={<EchoPage />} />
          <Route path="/write" element={<WriteLetter />} />
          <Route path="/letter/:id" element={<LetterPage />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  )
}
