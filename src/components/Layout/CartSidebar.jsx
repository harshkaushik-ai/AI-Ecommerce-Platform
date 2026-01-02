import { X, Plus, Minus, Trash2, Trash, ToggleLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart, updateCartQuantity } from "../../store/slices/cartSlice";
import { toggleCart } from "../../store/slices/popupSlice";

const CartSidebar = () => {
  const dispatch = useDispatch()
  const {cart} = useSelector((state)=>state.cart)
  const {isCartOpen} = useSelector((state)=>state.popup)
  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      dispatch(removeFromCart({ id }))
    } else {
      dispatch(updateCartQuantity({ id, quantity }))
    }
  }

  let total = 0
  if (cart) {
    total = Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0), 0) : 0
  }

  if(!isCartOpen) return null
  return <>
        <div className="fixed inset-0 bg(--inset-bg) backdrop-blur-sm z-40" onClick={()=>dispatch(toggleCart())}>
          <div className="fixed right-0 top-0 w-96 h-full z-40 glass-panel animate-slide-in-right overflow-y-auto" onClick={(e)=>{e.stopPropagation()}}>
            <div className="flex items-center justify-between pt-14 pb-4 border-b border-[hsla(var(--glass-border))]" onClick={(e)=>{e.stopPropagation()}}>
              <h2 className="text-xl font-semibold text-primary">Shopping Cart</h2>
              <button className="p-2 rounded-lg glass-card hover:glow-on-hover animate-smooth animate-slide-in-left"
                          onClick={()=>dispatch(toggleCart())}
                          >
                            <X className="h-5 w-5 text-primary" />
              </button>
            </div>

            <div className="p-6">
              {cart && cart.length === 0 ?
               (<div className="text-center py-12 ">
                    <p className="text-muted-foreground">Your cart is empty </p>
                    <Link to={"/products"} className="inline-block mt-4 py-2 px-6 gradient-primary text-primary-foreground rounded-lg hover:glow-on-hover animate-smooth">Browse Products</Link>
               </div>)
               : 
               (
                <>
                <div className="space-y-4 mb-6">
                  {cart && cart.map((item)=>{
                    return (
                      <div key={item.product?.id} className="glass-card p-4">
                        <div className="flex items-start space-x-4">
                          <img 
                          src={item.product?.images?.[0]?.url} 
                          alt={item.product?.name} 
                          className="w-16 h-16 object-cover rounded-lg"/>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white truncate">
                              {item.product.name}
                            </h3>
                            <p className="font-semibold text-white">₹{item.product?.price}</p>
                            <div className="flex items-center space-x-2 mt-2 text-white">
                            <button
                            className="p-1 rounded-lg glass-card hover:glow-on-hover animate-smooth"
                            onClick={()=>{
                              updateQuantity(
                                item.product.id,
                                item.quantity-1
                              )
                            }}
                            >
                              <Minus className="w-4 h-4"/>
                            </button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button
                            className="p-1 rounded-lg glass-card hover:glow-on-hover animate-smooth"
                            onClick={()=>{
                              updateQuantity(
                                item.product.id,
                                item.quantity+1
                              )
                            }}
                            >
                              <Plus className="w-4 h-4"/>
                            </button>
                            <button
                            className="p-1 rounded-lg glass-card hover:glow-on-hover animate-smooth ml-2 text-destructive"
                            onClick={()=>{
                              dispatch(removeFromCart({ id: item.product.id }))
                            }}
                            >
                              <Trash2 className="w-4 h-4  bg-red-500/10"/>
                            </button>
                          </div>
                          </div>
                          
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="border-t border-[hsla[var(--glass-border)]] pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-primary ">Total</span>
                    <span className="text-xl font-bold text-primary">₹{total.toFixed(2)}</span>
                  </div>
                  <Link to={"/cart"} onClick={()=>dispatch(toggleCart())} className="w-full py-3 text-center block text-primary-foreground gradient-primary rounded-lg hover:glow-on-hover animate-smooth">
                  View Cart & Checkout
                  </Link>
                </div>
                </>
               )}
            </div>
          </div>
        </div>

  </>
  
};

export default CartSidebar;
