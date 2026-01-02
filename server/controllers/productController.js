import { catchAsyncError } from "../middlewares/catchAsyncError.js"
import ErrorHandler from "../middlewares/errorMiddleware.js"
import database from "../database/db.js"
import {v2 as cloudinary} from "cloudinary"
import { getAIRecommendation } from "../utils/getAIRecommendation.js"


export const createProduct= catchAsyncError(async(req,res,next)=>{
    const {name,description,price,category,stock} = req.body
    const created_by= req.user.id

    if(!name || !description || !price || !category || !stock){
        return next(new ErrorHandler("Provide complete detail of product",400))
    }
    let uploadImages=[]
    if(req.files && req.files.images){
        const images = Array.isArray(req.files.images)?req.files.images:[req.files.images]

        for( const image of images){
            let result = await cloudinary.uploader.upload(image.tempFilePath,{
                folder:"Ecommerce_Product_Images",
                width:1000,
                crop:"scale"
            })
            
            uploadImages.push({
                url:result.secure_url,
                public_id:result.public_id
            })
        }
    }

    const product = await database.query(`INSERT INTO products (name,description,price,category,stock,images,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,[name,description,price,category,stock,JSON.stringify(uploadImages),created_by])
    res.status(200).json({
        success:true,
        message:"Product entry is created successfully",
        product:product.rows[0],
    })
})

export const fetchAllProducts = catchAsyncError(async(req,res,next)=>{
    const{availability,price,category,ratings,search} =req.query
    const page = parseInt(req.query.page) || 1
    const limit = 10
    const offset = (page-1)*limit

    let conditions = []
    let values = []
    let index = 1

    let paginationPlaceholders ={}

    //Filtering on basis of availability
    if(availability ===  "in-stock"){
        conditions.push(`stock > 5`)
    }
    else if(availability === "limited"){
        conditions.push(`stock > 0 AND stock <= 5`)
    }
    else if(availability === "out-of-stock"){
        conditions.push(`stock = 0`)
    }

    //Filtering on basis of price
    if(price){
        const [minprice,maxprice]= price.split("-")
        if(minprice && maxprice){
            conditions.push(`price BETWEEN $${index} AND $${index+1}`)
            values.push(minprice,maxprice)
            index +=2
        }
    }

    //Filtering on basis of category
    if(category){
        conditions.push(`category ILIKE $${index}`)
        values.push(`%${category}%`)
        index++
    }

    //Filtering on basis of ratings
    if(ratings){
        conditions.push(`ratings >= $${index}`)
        values.push(ratings)
        index++
    }

    //Add serach query
    if(search){
        conditions.push(`(p.name ILIKE $${index} OR p.description ILIKE $${index})`)
        values.push(`%${search}%`)
        index++
    }

    const whereClause = conditions.length?`WHERE ${conditions.join(" AND ")}`:""

    //Get count of filtered products
    const totalProductsResult = await database.query(`SELECT COUNT(*) FROM products p ${whereClause}`,values)

    const totalProducts = parseInt(totalProductsResult.rows[0].count)

    paginationPlaceholders.limit = `$${index}`
    values.push(limit)
    index++

    paginationPlaceholders.offset = `$${index}`
    values.push(offset)
    index++

    //Fetching With Reviews
    const query = `SELECT p.*,COUNT(r.id) FROM products p LEFT JOIN reviews r ON p.id = r.product_id ${whereClause} GROUP BY p.id ORDER BY created_at DESC LIMIT ${paginationPlaceholders.limit} OFFSET ${paginationPlaceholders.offset}`
    const result = await database.query(query,values)

    //Query for fetching new products 
    const newProductQuery = `SELECT p.*,COUNT(r.id) AS review_count FROM products p LEFT JOIN reviews r ON p.id = r.product_id WHERE p.created_at > NOW() - INTERVAL '30 days' GROUP BY p.id ORDER BY p.created_at DESC LIMIT 8`
    const newProductResult = await database.query(newProductQuery)

    //TOP RATED QUERY
    const topRatedQuery = `SELECT p.*,COUNT(r.id) AS review_count FROM products p LEFT JOIN reviews r ON p.id = r.product_id WHERE ratings >= 4.5 GROUP BY p.id ORDER BY p.created_at DESC LIMIT 8`
    const topResult = await database.query(topRatedQuery)

    res.status(200).json({
        success:true,
        message:"Fetched successfully",
        product:result.rows,
        totalProducts,
        newProductResult:newProductResult.rows,
        topResult:topResult.rows

    })
    
})

export const updateProduct = catchAsyncError(async(req,res,next)=>{
    const {productID} = req.params
    const {name,description,price,category,stock} =req.body
    if(!name || !description || !price || !category || !stock){
        return next(new ErrorHandler("Provide details of all fields"),400)
    }
    const product = await database.query(`SELECT * FROM products WHERE id = $1`,[productID])
    if(product.rows.length === 0){
        return next (new ErrorHandler("Product not found",404))
    }
    const result = await database.query(`UPDATE products SET name = $1,description = $2,price = $3,category = $4,stock=$5 WHERE id = $6 RETURNING *`,[name,description,price,category,stock,productID])
    res.status(200).json({
        success:true,
        message:"Product updated successfully",
        updatedProduct:result.rows[0]
    })

})

export const deleteProduct = catchAsyncError(async(req,res,next)=>{
    const {productID} = req.params
    
    const product = await database.query(`SELECT * FROM products WHERE id = $1`,[productID])
    if(product.rows.length === 0){
        return next(new ErrorHandler("Product not found",404))
    }

    const images = product.rows[0].images

    const deleteResult = await database.query(`DELETE FROM products WHERE id =$1 RETURNING *`,[productID])
    if(deleteResult.rows.length === 0){
        return next(new ErrorHandler("Failed to delete product",400))
    }
    if(images && images.length > 0){
        for (const image of images) {
            await cloudinary.uploader.destroy(image.public_id)
        }
    }
    res.status(200).json({
        success:true,
        message:"Product deleted successfully"
    })

})

export const fetchSingleProduct = catchAsyncError(async(req,res,next)=>{
    const {productID} = req.params

    const result = await database.query(`
        SELECT p.*,
        COALESCE(
        json_agg(
        json_build_object(
            'review_id',r.id,
            'rating',r.rating,
            'comment',r.comment,
            'reviewer',json_build_object(
                'id',u.id,
                'name',u.name,
                'avatar',u.avatar
            ))
        ) FILTER (WHERE r.id IS NOT NULL),'[]') AS reviews
         FROM products p 
         LEFT JOIN reviews r ON p.id = r.product_id 
         LEFT JOIN users u ON r.user_id = u.id
         WHERE p.id =$1
         GROUP BY p.id
        `,[productID])
        res.status(200).json({
            success:true,
            message:"Product Fetched Successfully",
            product:result.rows[0]
        })
})

// export const postProductReview = catchAsyncError(async(req,res,next)=>{
//     const {productID} = req.params
//     const {rating,comment} = req.body
//     if(!rating || !comment){
//         return next(new ErrorHandler("Please provide rating and comment",400))
//     }
//     const purchaseQueryCheck = `SELECT oi.product_id FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN payments p ON o.id = p.order_id WHERE buyer_id = $1 AND product_id = $2 AND payment_status = 'Paid' LIMIT 1`

//     const {rows} = await database.query(purchaseQueryCheck,[req.user.id,productID])

//     if(rows.length === 0){
//         return res.status(403).json({
//             success:false,
//             message:"only buyer can rate the product"
//         })
//     }

//     const product = await database.query(`SELECT * FROM products WHERE id = $1`,[productID])
//     if(product.rows.length === 0){
//         return next(new ErrorHandler("No product found",404))
//     }

//     const isAlreadyReviewed = await database.query(`SELECT * FROM reviews WHERE product_id = $1 AND user_id = $2`,[productID,req.user.id])

//     let review
//     if(isAlreadyReviewed.rows.length > 0){
//         review = await database.query(`UPDATE reviews SET rating =$1 ,comment = $2 WHERE product_id=$3 AND user_id=$4 RETURNING *`,[rating,comment,productID,req.user.id])
//     }
//     else{
//         review = await database.query(`INSERT INTO reviews (product_id,user_id,rating,comment) VALUES ($1,$2,$3,$4) RETURNING *`,[productID,req.user.id,rating,comment])
//     }

//     const allReviews = await database.query(`SELECT AVG(rating) AS avg_rating FROM reviews WHERE product_id=$1`,[productID])

//     const newAvgRating = allReviews.rows[0].avg_rating

//     const updateProduct = await database.query(`UPDATE products SET ratings =$1 WHERE id=$2`,[newAvgRating,productID]) 
//     res.status(200).json({
//         success:true,
//         message:'Reviews posted',
//         review:review.rows[0],
//         product:updateProduct.rows[0]
//     })
// })

export const postProductReview = catchAsyncError(async (req, res, next) => {
  const { productID } = req.params;
  const { rating, comment } = req.body;
  if (!rating || !comment) {
    return next(new ErrorHandler("Please provide rating and comment.", 400));
  }
  const purchasheCheckQuery = `
    SELECT oi.product_id
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    JOIN payments p ON p.order_id = o.id
    WHERE o.buyer_id = $1
    AND oi.product_id = $2
    AND p.payment_status = 'Paid'
    LIMIT 1 
  `;

  const { rows } = await database.query(purchasheCheckQuery, [
    req.user.id,
    productID,
  ]);

  if (rows.length === 0) {
    return res.status(403).json({
      success: false,
      message: "You can only review a product you've purchased.",
    });
  }

  const product = await database.query("SELECT * FROM products WHERE id = $1", [
    productID,
  ]);
  if (product.rows.length === 0) {
    return next(new ErrorHandler("Product not found.", 404));
  }

  const isAlreadyReviewed = await database.query(
    `
    SELECT * FROM reviews WHERE product_id = $1 AND user_id = $2
    `,
    [productID, req.user.id]
  );

  let review;

  if (isAlreadyReviewed.rows.length > 0) {
    review = await database.query(
      "UPDATE reviews SET rating = $1, comment = $2 WHERE product_id = $3 AND user_id = $4 RETURNING *",
      [rating, comment, productID, req.user.id]
    );
  } else {
    review = await database.query(
      "INSERT INTO reviews (product_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *",
      [productID, req.user.id, rating, comment]
    );
  }

  const allReviews = await database.query(
    `SELECT AVG(rating) AS avg_rating FROM reviews WHERE product_id = $1`,
    [productID]
  );

  const newAvgRating = allReviews.rows[0].avg_rating;

  const updatedProduct = await database.query(
    `
        UPDATE products SET ratings = $1 WHERE id = $2 RETURNING *
        `,
    [newAvgRating, productID]
  );

  const populatedReview = await database.query(
  `
  SELECT 
    r.id AS review_id,
    r.rating,
    r.comment,
    json_build_object(
      'id', u.id,
      'name', u.name,
      'avatar', u.avatar
    ) AS reviewer
  FROM reviews r
  JOIN users u ON u.id = r.user_id
  WHERE r.product_id = $1 AND r.user_id = $2
  `,
  [productID, req.user.id]
);

  res.status(200).json({
    success: true,
    message: "Review posted.",
    review: populatedReview.rows[0],
    product: updatedProduct.rows[0],
  });
});

export const deleteReview = catchAsyncError(async(req,res,next)=>{
    const {productID} = req.params
    const review = await database.query(`DELETE FROM reviews WHERE product_id=$1 AND user_id=$2 RETURNING *`,[productID,req.user.id])
    if(review.rows.length === 0){
        return next(new ErrorHandler("Review not found",404))
    }
    
     const allReviews = await database.query(`SELECT AVG(rating) AS avg_rating FROM reviews WHERE product_id=$1`,[productID])

    const newAvgRating = allReviews.rows[0].avg_rating

    const updateProduct = await database.query(`UPDATE products SET ratings =$1 WHERE id=$2`,[newAvgRating,productID]) 
    res.status(200).json({
        success:true,
        message:"Review deleted successfully",
        product:updateProduct.rows[0]
    })

})

export const fetchAIFilteredProducts =catchAsyncError(async(req,res,next)=>{
    const {userPrompt} = req.body
    if(!userPrompt){
        return next(new ErrorHandler("Please Enter valid prompt",400))
    }

    const filteredKeywords = (query) =>{

        const stopWords = new Set([
            "the",
        "they",
        "them",
        "then",
        "I",
        "we",
        "you",
        "he",
        "she",
        "it",
        "is",
        "a",
        "an",
        "of",
        "and",
        "or",
        "to",
        "for",
        "from",
        "on",
        "who",
        "whom",
        "why",
        "when",
        "which",
        "with",
        "this",
        "that",
        "in",
        "at",
        "by",
        "be",
        "not",
        "was",
        "were",
        "has",
        "have",
        "had",
        "do",
        "does",
        "did",
        "so",
        "some",
        "any",
        "how",
        "can",
        "could",
        "should",
        "would",
        "there",
        "here",
        "just",
        "than",
        "because",
        "but",
        "its",
        "it's",
        "if",
        ".",
        ",",
        "!",
        "?",
        ">",
        "<",
        ";",
        "`",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        ])

        return query
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((word)=>!stopWords.has(word))
        .map((word)=>`%${word}%`)
    }

    const keywords = filteredKeywords(userPrompt)

    //STEP 1: BASIC SQL FILTERING
    const result = await database.query(`SELECT * FROM products WHERE name ILIKE ANY($1) OR description ILIKE ANY($1) OR category ILIKE ANY($1) LIMIT 200 `,[keywords])

    const filteredProducts = result.rows

    if(filteredProducts.length === 0){
        return res.status(200).json({
            success:true,
            message:"No matched products found",
            products:[]
        })
    }

    //STEP 2: AI FILTERING
    try{
    const products = await getAIRecommendation(userPrompt,filteredProducts)
    res.status(200).json({
        success:true,
        message:"AI filtered products",
        products
    })
    }catch(error){
        return next(new ErrorHandler(error.message || "AI Filtering failed", 500));
    }   

})