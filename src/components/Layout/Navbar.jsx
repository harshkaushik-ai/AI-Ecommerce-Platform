import { Menu, User, ShoppingCart, Sun, Moon, Search } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useDispatch, useSelector } from "react-redux";
import {toggleSidebar,toggleAuthPopup,toggleCart, toggleSearchBar} from "../../store/slices/popupSlice.js"

const Navbar = () => {

  const {theme,toggleTheme} = useTheme()

  const dispatch = useDispatch()

  const {cart} = useSelector((state)=>state.cart)
  let cartItemsCount = 0
  if(cart){
    cartItemsCount = Array.isArray(cart) ? cart.reduce((total,item) => total + item.quantity,0) : 0
  }


  return (
  <>
      <nav className="fixed left-0 overflow-hidden w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className=" max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center  h-16">
          {/* HAMBURGER MENU */}
          <button 
          onClick={()=>dispatch(toggleSidebar())}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
          <Menu className="w-6 h-6 text-foreground" />
          </button>
          {/* CENTER LOGO */}
          <div className=" flex-1 flex justify-center gap-2 items-center">
            {/* <img src="/nexza.png" alt="NexZA logo"  className="h-6 w-6"/> */}
            <h1 className="text-2xl font-bold text-primary">NexZA</h1> 
          </div>

          {/* RIGHT SIDE ICONS */}
          <div className="flex items-center space-x-2">
            {/* TOGGLE THEME */}
          <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
           {theme === "dark" ? (<Sun className="w-5 h-5 text-foreground"/>):(<Moon className="w-5 h-5 text-foreground" />)} 
          </button>

          {/* SEARCH OVERLAY */}
          <button
          onClick={()=>dispatch(toggleSearchBar())}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
           <Search className="w-5 h-5 text-foreground" />
          </button>

          {/* USER LOGO */}
          <button
          onClick={()=>dispatch(toggleAuthPopup())}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
           <User className="w-5 h-5 text-foreground" />
          </button>

            {/* CART LOGO */}
           <button
          onClick={()=>dispatch(toggleCart())}
          className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
          >
           <ShoppingCart className="w-5 h-5 text-foreground" />
           {cartItemsCount > 0 && (
            <span className="absolute -top-1 -right-1 text-primary-foreground bg-primary text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartItemsCount}</span>
           )}
          </button>
          </div>

        </div>

      </div>

      </nav>
  </>
  )
};

export default Navbar;
