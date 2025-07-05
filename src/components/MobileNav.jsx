import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import logo from '../assets/logo.jpg'


function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-100 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          {isOpen 
            ? <path strokeLinecap="round\" strokeLinejoin="round\" d="M6 18L18 6M6 6l12 12" />
            : <path strokeLinecap="round\" strokeLinejoin="round\" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          }
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40 bg-gradient-to-b from-blue-400/15 to-blue-600 backdrop-brightness-75 flex flex-col">
          
          <div className="relative p-4">
            <div className="flex flex-col items-center">
              <img 
                src={logo}
                alt="Logo"
                className="w-20 h-20 rounded-full object-cover mb-2 shadow-md border-2 border-blue-600" 
             />
              <h1 className="text-2xl font-bold text-blue-800">AQUA</h1>
              <h2 className="text-xl font-bold text-blue-600">ALIGNED</h2>
            </div>
          </div>
          
          <nav className="relative flex flex-col p-4 space-y-4">
            <NavLink 
              to="/dashboard" 
              className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
              end
            >
              <div className="w-8 h-8 rounded-full border-white border-2 border-current flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </div>
              <span className="font-bold text-white">Home</span>
            </NavLink>
            
            <NavLink 
              to="/logs" 
              className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <div className="w-8 h-8 rounded-full border-white border-2 border-current flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
              </div>
              <span className="font-bold text-white">Logs</span>
            </NavLink>

            <NavLink 
            to="/login"
            className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <div className="w-8 h-8 rounded-full border-white border-2  flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 2C3.34315 2 2 3.34315 2 5V19C2 20.6569 3.34315 22 5 22H14.5C15.8807 22 17 20.8807 17 19.5V16.7326C16.8519 16.647 16.7125 16.5409 16.5858 16.4142C15.9314 15.7598 15.8253 14.7649 16.2674 14H13C11.8954 14 11 13.1046 11 12C11 10.8954 11.8954 10 13 10H16.2674C15.8253 9.23514 15.9314 8.24015 16.5858 7.58579C16.7125 7.4591 16.8519 7.35296 17 7.26738V4.5C17 3.11929 15.8807 2 14.5 2H5Z"/>
              </svg>
            </div>
            <span className="font-bold text-white">Log Out</span>
          </NavLink>
          </nav>
        </div>
      )}
    </div>
  )
}

export default MobileNav