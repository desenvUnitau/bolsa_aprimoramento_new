import { Route, Routes } from "react-router-dom";
import Home from "./Home/Home";



export default function Conteudo(){
    return(
        <main className="conteudo-custom flex-grow-1" >
            <div className="container py-2">
                <Routes>
                    <Route path="/" element={<Home />} />
                </Routes>
            </div>
        </main>
    )
}