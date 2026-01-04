import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
import { toggleAIModal } from "./popupSlice";
import { useSelector } from "react-redux";

export const fetchAllProducts = createAsyncThunk("/fetchallproducts",
  async({availability = "",price = "0-1000000",category = "",ratings = "",search = "",page = 1},thunkAPI)=>{
    try{
      const params = new URLSearchParams()

      if(category) params.append("category",category)
      if(search) params.append("search",search)
      if(price) params.append("price",price)
      if(ratings) params.append("ratings",ratings)
      if(availability) params.append("availability",availability)
      if(page) params.append("page",page)

      const res = await axiosInstance.get(`/product?${params.toString()}`)
      return res.data

    }catch(error){
      return thunkAPI.rejectWithValue(error.response.data.message || "Failed to fetch products") 
    }
  

})

export const fetchProductDetails = createAsyncThunk("/product/singleProduct",async(id,thunkAPI)=>{
  try{
  const res = await axiosInstance.get(`/product/singleProduct/${id}`)
  return res.data.product
  }catch(error){
    return thunkAPI.rejectWithValue(error.response.data.message || "Failed to get matched product details")
  }
})

export const postReview = createAsyncThunk("/post-new/review",async({productId,review},thunkAPI)=>{
  console.log("Posting review for product ID:", productId, "with data:", review);
    try{
      const res = await axiosInstance.put(`/product/post-new/review/${productId}`,review)
      toast.success(res.data.message)
      return res.data.review
    }catch(error){
      toast.error(error.response?.data?.message)
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to Post Review") 
      
    }
})

export const deleteReview = createAsyncThunk("/delete/review",async({productId,reviewId},thunkAPI)=>{

  console.log("Deleting review with ID:", reviewId, "for product ID:", productId);
    try{
      const res = await axiosInstance.delete(`/product/delete/review/${productId}`)
      toast.success(res.data.message)
      return reviewId
    }catch(error){
      toast.error(error.response?.data?.message)
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to Post Review") 
      
    }
})

export const fetchProductWithAI = createAsyncThunk("/product/aisearch",async(userPrompt,thunkAPI)=>{
  try{
 
    const res = await axiosInstance.post(`/product/aisearch`,{userPrompt})
  
    thunkAPI.dispatch(toggleAIModal())
    return res.data
  }catch(error){
    console.error("AI Search error:", error.response?.data)
    toast.error(error.response?.data?.message || "AI search failed")
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to get matched product details")
  }
})

// const {authUser} = useSelector((state)=>state.auth)


const productSlice = createSlice({
  name: "product",
  initialState: {
    loading: false,
    products: [],
    productDetails: {},
    totalProducts: 0,
    topRatedProducts: [],
    newProducts: [],
    aiSearching: false,
    isReviewDeleting: false,
    isPostingReview: false,
    productReviews: [],
  },
  extraReducers: (builder) => {
    builder
    .addCase(fetchAllProducts.pending,(state)=>{
      state.loading = true
    })
     .addCase(fetchAllProducts.fulfilled,(state,action)=>{
      state.loading = false
      state.products = action.payload.product || []
      state.newProducts = action.payload.newProductResult || []
      state.topRatedProducts = action.payload.topResult || []
      state.totalProducts = action.payload.totalProducts || 0
    })
     .addCase(fetchAllProducts.rejected,(state)=>{
      state.loading = false
    })
    .addCase(fetchProductDetails.pending,(state)=>{
      state.loading = true
    })
     .addCase(fetchProductDetails.fulfilled,(state,action)=>{
      state.loading = false
     state.productDetails = action.payload
     state.productReviews = action.payload.productReviews || []
     }) 
     .addCase(fetchProductDetails.rejected,(state)=>{
      state.loading = false
    })
    .addCase(postReview.pending,(state)=>{
      state.isPostingReview = true
    })
     .addCase(postReview.fulfilled,(state,action)=>{
      state.isPostingReview = false
     const newReview = action.payload;
     const existingReviewIndex = state.productReviews.findIndex((review => review.reviewer?.user_id === newReview.reviewer?.user_id));
     if(existingReviewIndex !== -1) {
       state.productReviews[existingReviewIndex].rating = Number(newReview.rating)
       state.productReviews[existingReviewIndex].comment = newReview.comment
       console.log("Updated existing review:", state.productReviews[existingReviewIndex]);
     } else {
       // Use reviewer data from API response, not authUser
       state.productReviews = [newReview,...state.productReviews]
       console.log("Added new review:", newReview);
     }
     })
     .addCase(postReview.rejected,(state)=>{
      state.isPostingReview= false
    })
    .addCase(deleteReview.pending,(state)=>{
      state.isReviewDeleting = true
    })
     .addCase(deleteReview.fulfilled,(state,action)=>{
      state.isReviewDeleting = false
     state.productReviews = state.productReviews.filter((review)=> review.review_id !== action.payload)
     }) 
     .addCase(deleteReview.rejected,(state)=>{
      state.isReviewDeleting= false
    })
    .addCase(fetchProductWithAI.pending,(state)=>{
      state.aiSearching = true
    })
     .addCase(fetchProductWithAI.fulfilled,(state,action)=>{
      state.aiSearching = false
      // Try multiple possible response structures
      const products = 
        action.payload?.products?.products ||  // ← Nested products.products
        action.payload?.product || 
        action.payload?.products ||
        action.payload?.matchedProducts || 
        []
      
      console.log("Full AI response:", action.payload)
      console.log("Extracted products array:", products)
      
      state.products = Array.isArray(products) ? products : []
      state.totalProducts = Array.isArray(products) ? products.length : 0
      
      console.log("Updated state.products:", state.products)
    }) 
     .addCase(fetchProductWithAI.rejected,(state)=>{
      state.aiSearching= false
    })
  },
});



export default productSlice.reducer;
