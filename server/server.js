import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import {v2 as cloudinary} from "cloudinary"
// import serverless from "serverless-http";


cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLIENT_NAME,
    api_key:process.env.CLOUDINARY_CLIENT_API,
    api_secret:process.env.CLOUDINARY_CLIENT_SECRET
})


// export const handler = serverless(app);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});