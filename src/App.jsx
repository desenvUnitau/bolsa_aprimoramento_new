import { BrowserRouter, Routes, Route } from "react-router-dom";

import Identificacao from "./Auth/Identificacao";
import PrivateRoute from "./routes/PrivateRoute";
import Conteudo from "./components/Conteudo";
import Cabecalho from "./components/Cabecalho/Cabecalho";
import LoginAdm from "./Auth/LoginAdm";

function App() {

  return (
    <BrowserRouter>
      <div className="App d-flex flex-column min-vh-100">
        <Cabecalho />
        <div className="flex-grow-1">
            <Routes>
              <Route path="/login" element={<Identificacao />}/>

              <Route path="/admin/login" element={<LoginAdm />} />

              <Route path="/*" element={
                // <PrivateRoute>
                  <Conteudo />
                // </PrivateRoute>
              } />
              
            </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
