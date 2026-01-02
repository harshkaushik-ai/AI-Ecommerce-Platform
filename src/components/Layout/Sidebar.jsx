// import React from "react";
import {
  X,
  Home,
  Package,
  Info,
  HelpCircle,
  ShoppingCart,
  List,
  Phone,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar } from "../../store/slices/popupSlice";    



const Sidebar = () => {
  
  const dispatch = useDispatch()
  const {authUser} = useSelector((state)=>state.auth)
   const menuItems = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Products", icon: Package, path: "/products" },
    { name: "About", icon: Info, path: "/about" },
    { name: "FAQ", icon: HelpCircle, path: "/faq" },
    { name: "Contact", icon: Phone, path: "/contact" },
    { name: "Cart", icon: ShoppingCart, path: "/cart" },
    authUser && { name: "My Orders", icon: List, path: "/orders" },
  ];

  const {isSidebarOpen} = useSelector((state)=>state.popup)

  if(!isSidebarOpen) return null

  return(
   <>
   <div className="fixed inset-0 --inset-bg backdrop-blur-sm z-40" 
   onClick={()=>dispatch(toggleSidebar())}
   >
      <div className="fixed left-0 top-0 w-80 h-full z-40 glass-panel animate-slide-in-left" onClick={(e)=>{e.stopPropagation()}}>
        <div className="flex items-center justify-between pt-14 pb-4 border-b border-[hsla(var(--glass-border))]"
        onClick={(e)=>{e.stopPropagation()}}>
            <h2 className="text-xl font-semibold text-primary">Menu</h2>
            <button className="p-2 rounded-lg glass-card hover:glow-on-hover animate-smooth"
            onClick={()=>dispatch(toggleSidebar())}
            >
              <X className="h-5 w-5 text-primary" />
            </button>
        </div>

        <nav className="p-6">
          <ul className="space-y-2">
            {menuItems.filter(Boolean).map((item)=>{
              return (
              <li key={item.name}>
                <Link
                to={item.path}
                onClick={()=>dispatch(toggleSidebar())}
                className="flex items-center space-x-3 rounded-lg p-3 glass-card hover:glow-on-hover animate-smooth text-foreground hover:text-primary group:"
                >
                  <item.icon className="w-5 h-5    group-hover:text-primary" />
                  <span className="font-medium ">{item.name}</span>
                </Link>
              </li>
              )
            })}
          </ul>

        </nav>

      </div>
   </div>
   </>
   )
};

export default Sidebar;
