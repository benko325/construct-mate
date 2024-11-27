import './App.css'
import { Outlet } from 'react-router-dom'
import { ThemeProvider } from './components/theme-provider'
import { ToastContainer } from 'react-toastify'

function App() {
    return (
        <>
            <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
                <Outlet />
            </ThemeProvider>
            <ToastContainer position="bottom-right" autoClose={1500} hideProgressBar={true} closeOnClick pauseOnHover/>
        </>
    )
}

export default App
