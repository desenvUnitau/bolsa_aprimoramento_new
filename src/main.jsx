import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'react-toastify/dist/ReactToastify.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-loading-skeleton/dist/skeleton.css'

// import { setAuthToken } from './config/api.jsx';

// const token = localStorage.getItem("bolsaAprimora")

// if(token){
//   setAuthToken(token);
// }

import { initAuth } from './config/api'

// 👇 inicializa auth
initAuth();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
