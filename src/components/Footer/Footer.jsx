import './Footer.css'
export default function Footer(){
    return(
        <footer className="footer-custom">
            <div className="container text-center">
                <p>© {new Date().getFullYear()} Controle de Processo. Todos os direitos reservados.</p>
            </div>
        </footer>
    )
}