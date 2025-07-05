import { NavLink } from 'react-router-dom'
import logo from '../assets/logo.png'

function Sidebar() {
  return (
    <aside className="w-48 bg-white bg-opacity-80 backdrop-blur-sm shadow-lg hidden md:block">
      <div className="absolute inset-0 bg-[url('/src/assets/Bgimage.jpg')] bg-cover bg-center opacity-70"></div>
      <div className="p-3 sticky top-4">
        <div className="mb-15">
          <div className="flex flex-col items-center">
            <img 
              src={logo}
              alt="Logo"
              className="w-25 h-25 rounded-full object-cover mb-4 shadow-2xl border-2 border-blue-600" 
            />
            <h1 className="text-2xl font-bold text-blue-600">AQUA</h1>
            <h2 className="text-2xl font-semibold mb-10 text-gray-600">ALIGNED</h2>
          </div>
        </div>
        
        <nav className="mt-10 space-y-5">
          <NavLink 
            to="/dashboard" 
            className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
            end
          >
            <div className="w-10 h-10 rounded-full border-2 border-gray-800 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <span>Home</span>
          </NavLink>
          
          <NavLink 
            to="/logs" 
            className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <div className="w-10 h-10 rounded-full border-2 border-gray-800 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            </div>
            <span>Logs</span>
          </NavLink>

        </nav>
        <nav className="mt-52 space-y-5">
          <NavLink 
            to="/login"
            className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <div className="w-10 h-10 rounded-full border-2 border-gray-800 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 2C3.34315 2 2 3.34315 2 5V19C2 20.6569 3.34315 22 5 22H14.5C15.8807 22 17 20.8807 17 19.5V16.7326C16.8519 16.647 16.7125 16.5409 16.5858 16.4142C15.9314 15.7598 15.8253 14.7649 16.2674 14H13C11.8954 14 11 13.1046 11 12C11 10.8954 11.8954 10 13 10H16.2674C15.8253 9.23514 15.9314 8.24015 16.5858 7.58579C16.7125 7.4591 16.8519 7.35296 17 7.26738V4.5C17 3.11929 15.8807 2 14.5 2H5Z"/>
              </svg>
            </div>
            <span>Log Out</span>
          </NavLink>
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar