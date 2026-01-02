
export async function getAIRecommendation(userPrompt,products){

    const API_KEY=process.env.GEMINI_API_KEY
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`

    try{
        const geminiPrompt = `
        Here is a list of avaiable products:
        ${JSON.stringify(products, null, 2)}

        Based on the following user request, filter and suggest the best matching products:
        "${userPrompt}"

        Only return the matching products in JSON format.
    `
    const response = await fetch(URL,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            contents:[{parts:[{text:geminiPrompt}]}],
            generationConfig: {
                    response_mime_type: "application/json",
                }
        })
    })

    const data = await response.json()
    console.log(data)
    const aiResponseText = data.candidates[0].content.parts[0].text.trim() ||""
   if (!aiResponseText) {
            throw new Error("AI response is empty")
        }
    const cleanedText = aiResponseText.replace(/```json|```/g, ``).trim()
    console.log(cleanedText)

    if(!cleanedText){
        throw new Error("AI response is empty after cleaning")
    }

    let parsedProducts 
    try{
        parsedProducts = JSON.parse(cleanedText)

    }catch(error){
         throw new Error("Failed to parse AI response")
    }

    return {success:true,products:parsedProducts}
    }catch(error){
        throw new Error(error.message || "Gemini API failed")
    }

}