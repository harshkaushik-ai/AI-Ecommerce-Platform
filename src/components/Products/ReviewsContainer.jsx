import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteReview, postReview } from "../../store/slices/productSlice";
import { Star } from "lucide-react";

const ReviewsContainer = ({ product, productReviews }) => {
  const {authUser} = useSelector((state)=>state.auth)
  const {isPostingReview,isReviewDeleting} = useSelector((state)=>state.product)
  const dispatch = useDispatch()
  const [rating, setRating] = useState(1)
  const [comment, setComment] = useState("")

  const handleReviewSubmit = (e) =>{
    e.preventDefault()
    const reviewData = {
      rating,
      comment
    }
    console.log("Submitting review for product:", product.id, reviewData)
    dispatch(postReview({productId: product.id, review: reviewData}))
  }

  return <>
  {
    authUser && (
      <form onSubmit={handleReviewSubmit} className="mb-8 space-y-4">
        <h4 className="text-lg font-semibold">Leave a review</h4>
        <div className="flex items-center space-x-2">
          {
            [...Array(5)].map((_,i)=>{
              return <button key={i}
              type="submit" 
              onClick={()=>setRating(i+1)}
              className={`text-2xl${i<rating ? " text-yellow-400" : " text-gray-400 hover:text-yellow-300" }`}>
              ☆
              </button>
            })
          }

        </div>
        <textarea 
        value={comment}
        onChange={(e)=>setComment(e.target.value)}
        rows={4}
        placeholder="Write your review..."
        disabled={isPostingReview || isReviewDeleting}
        className="w-full p-3 rounded-md border-border bg-background text-foreground"/>
        <button type="submit" disabled={isPostingReview || isReviewDeleting} className="px-6 py-2 bg-primary text-secondary rounded-lg hover:glow-on-hover animate-smooth font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
          {isPostingReview ? "Submitting..." : "Submit Review"}

        </button>


      </form>
    )
  }

  <h3 className="text-xl font-semibold text-foreground mb-6">Customer Review</h3>
  {
    productReviews && productReviews.length >0 ? (
      <div className="space-y-6">
        {
          productReviews.map((review)=>{
            return(
              <div key={review.id} className="glass-card p-6">
                <div className="flex items-center space-x-4 ">
                  <img src={review.reviewer?.avatar?.url || "/avatar-holder.avif"} alt={review.reviewer?.name}
                  className="w-12 h-12 rounded-full text-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h4 className="font-semibold text-foreground">{review.reviewer?.name}</h4>
                      
                      <div className="flex">
                        {[...Array(5)].map((_,i)=>{
                        return <Star key={i} className={`w-4 h-4 ${i < Math.floor(review.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                      })}

                      </div>
                    </div>

                    <p className="text-muted-foreground mb-2">{review.comment}</p>
                    {authUser?.id === review.reviewer?.id && (
                      <button 
                      onClick={()=>dispatch(deleteReview({productId:product.id,reviewId:review.review_id}))} className="my-6 w-fit flex items-center space-x-3 p-3 rounded-lg glass-card hover:glow-on-hover text-destructive hover:text-destructive-foreground group">
                        {isReviewDeleting ? (
                          <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin">{" "}
                            <span>Deleting Reveiw...</span>
                          </div>
                          </>
                        ) : (<span>Delete Review</span>)}
                      </button>
                    )}

                  </div>
                </div>
                </div>
            )
          })
        }

      </div>
    ):(
      <p className="text-muted-foreground">
        No reviews yet. Be the first to review this product!
      </p>
    )
  }

  </>;
};

export default ReviewsContainer;
