import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Identificacao from "./Auth/Identificacao";
import PrivateRoute from "./routes/PrivateRoute";
import GuestRoute from "./routes/GuestRoute";
import Conteudo from "./components/Conteudo";
import ConteudoAdmin from "./components/admin/ConteudoAdmin";
import ConteudoSecretaria from "./components/secretaria/ConteudoSecretaria";
import ConteudoDiretor from "./components/diretor/ConteudoDiretor";
import Cabecalho from "./components/Cabecalho/Cabecalho";
import LoginAdm from "./Auth/LoginAdm";
import LoginSecretaria from "./Auth/LoginSecretaria";
import LoginDiretor from "./Auth/LoginDiretor";

function App() {
  const alunoContent = (
    <PrivateRoute>
      <Conteudo />
    </PrivateRoute>
  );

  const adminContent = (
    <PrivateRoute>
      <ConteudoAdmin />
    </PrivateRoute>
  );

  const secretariaContent = (
    <PrivateRoute>
      <ConteudoSecretaria />
    </PrivateRoute>
  );

  const diretorContent = (
    <PrivateRoute>
      <ConteudoDiretor />
    </PrivateRoute>
  );

  return (
    <BrowserRouter>
      <div className="App d-flex flex-column min-vh-100">
        <Cabecalho />
        <div className="flex-grow-1">
            <Routes>
              <Route path="/login" element={<GuestRoute><Identificacao /></GuestRoute>}/>

              <Route path="/admin/login" element={<GuestRoute><LoginAdm /></GuestRoute>} />
              <Route path="/secretaria/login" element={<GuestRoute><LoginSecretaria /></GuestRoute>} />
              <Route path="/diretor/login" element={<GuestRoute><LoginDiretor /></GuestRoute>} />

              <Route path="/admin/*" element={adminContent} />
              <Route path="/secretaria/*" element={secretariaContent} />
              <Route path="/diretor/*" element={diretorContent} />

              <Route path="/*" element={alunoContent} />
              
            </Routes>
        </div>
        <ToastContainer position="top-right" autoClose={4000} />
      </div>
    </BrowserRouter>
  )
}

export default App
