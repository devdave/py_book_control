import React from 'react'
import ReactDOM from 'react-dom/client'

import {WebRoot} from "./WebRoot.tsx"

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WebRoot />
  </React.StrictMode>,
)
