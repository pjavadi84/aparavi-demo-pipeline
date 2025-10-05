import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PipelineReactFlow from './PipelineReactFlow'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PipelineReactFlow />
  </StrictMode>,
)
