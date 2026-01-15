import { useState, useEffect } from "react";
import { Search, Sparkles, Star, Filter } from "lucide-react";
import { categories } from "../data/products";
import ProductCard from "../components/Products/ProductCard";
import Pagination from "../components/Products/Pagination";
import AISearchModal from "../components/Products/AISearchModal";
import { toggleAIModal } from "../store/slices/popupSlice";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { fetchAllProducts } from "../store/slices/productSlice";


const Products = () => {

  const { products, totalProducts } = useSelector((state) => state.product)

  
  // const useQuery = ()=>{
  //   return new URLSearchParams(useLocation().search)

  // }

  // const query = useQuery()
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const searchTerm = query.get("search")
  const searchedCategory = query.get("category")

  const [searchQuery, setSearchQuery] = useState(searchTerm || "")
  const [selectedCategory, setSelectedCategory] = useState(searchedCategory || "")
  const [priceRange, setPriceRange] = useState([0, 1000000])
  const [selectedRating, setSelectedRating] = useState(0)
  const [availability, setAvailability] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)



  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchAllProducts({
      category: selectedCategory,
      price: `${priceRange[0]}-${priceRange[1]}`,
      ratings: selectedRating,
      search: searchQuery,
      page: currentPage,
      availability: availability,
    }))
  }, [selectedCategory, priceRange, selectedRating, searchQuery, currentPage, availability, dispatch])

  const totalPages = Math.max(1, Math.ceil(totalProducts / 10))

  return <>

     <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* FILTERS SECTION */}
          <button onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="lg:hidden mb-4 p-3 glass-card hover:glow-on-hover animate-smooth flex items-center space-x-2"
          >
            <Filter className="w-5 h-5 " />
            <span>Filter</span>
          </button>

          {/* SIDEBAR FILTER */}
          <div className={`lg:block ${isMobileFilterOpen ? "block" : "hidden"} lg:w-80 w-full space-y-6 lg:sticky lg:top-24 self-start`}>
            <div className="glass-panel overflow-y-auto max-h-[85vh] scrollbar-hide p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Filters</h2>

              {/* PRICE RANGE */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Price Range</h3>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-green-400" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>


              </div>

              {/* RATING */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-foreground mb-3">Rating</h3>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => {
                    return (
                      <button key={rating}
                        onClick={() => setSelectedRating(selectedRating === rating ? 0 : rating)}
                        className={`flex items-center space-x-2 w-full p-2 rounded ${selectedRating === rating ? "bg-primary/20 " : "hover:bg-secondary"} `}>
                        {[...Array(5)].map((_, i) => {
                          return <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                        })}

                      </button>
                    )
                  }
                  )}
                </div>


              </div>

              {/* AVAILABILITY */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-foreground mb-3">Availability</h3>
                <div className="space-y-2">
                  {["in-stock", "out-of-stock", "limited"].map((status) => {
                    return (
                      <button key={status} onClick={() => {
                        setAvailability(availability === status ? "" : status)
                      }}
                        className={`w-full text-left p-2 rounded ${availability === status ? "bg-primary/20 " : "hover:bg-secondary"}`}>

                        {status === "in-stock" ? "In Stock" : status === "out-of-stock" ? "Out of Stock" : "Limited Stock"}

                      </button>
                    )
                  })}
                </div>

              </div>

              {/* CATEGORY */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-foreground mb-3">Category</h3>
                <div className="space-y-2">
                  <button 
                  onClick={()=>setSelectedCategory("")} 
                  className={`w-full text-left p-2 rounded ${selectedCategory === "" ? "bg-primary/20 " : "hover:bg-secondary"}`}>
                  All Categories
                  </button>
                  {categories.map((category) => {
                    return (
                      <button key={category.id} onClick={() => setSelectedCategory(category.name)} className={`w-full text-left p-2 rounded ${selectedCategory === category.name ? "bg-primary/20 " : "hover:bg-secondary"}`}>
                        {category.name}

                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1">
            {/* SEARCH BAR */}
            <div className="mb-8 flex max-[440px]:flex-col items-center gap-2">
              <div className="relative w-[-webkit-fill-available]">
                <Search className="absolute left-3 top-1.5 transform translate-y-1/2 w-5 h-5 text-muted-foreground"/>
                <input type="text "
                placeholder="Search Products" 
                value={searchQuery}
                onChange={(e)=>setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none text-foreground placeholder-muted-foreground"
                />
              </div>
                <button
                className="relative inline-flex items-center justify-center p-0.5 
                overflow-hidden text-sm font-medium text-gray-900 rounded-lg group 
                bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 
                group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 
                focus:outline-none focus:ring-purple-200 
                dark:focus:ring-purple-800 max-[440px]:min-w-full w-[160px] h-[52px] whitespace-nowrap flex-shrink-0"
                onClick={() => dispatch(toggleAIModal())}
              >
                <span className="relative w-full px-5 py-3 transition-all ease-in duration-75 
                bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent 
                group-hover:dark:bg-transparent flex justify-center items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>AI Search</span>
                </span>
              </button>
            </div>

            {/* PRODUCTS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-6 mb-6">
              {products.map((product)=>(
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages >= 1 && (
              <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page)=>setCurrentPage(page)}
              />
            )}

            {/* NO RESULTS */}
            {
              products.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No products found matching your criteria.
                  </p>
                </div> 
              )
            }
          </div>


        </div>
      </div>

      {/* AI Search Modal */}
      <AISearchModal />


    </div>

  </>
};

export default Products;
