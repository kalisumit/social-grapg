import { getFriendRecomendation, getHobbyRecommendations } from "../services/recomendationService.js";

export const getRecommendations = async (req,res)=>{
    try {
        const {id} = req.params;
        const friendRecommendations = await getFriendRecomendation(id);

        const hobbyRecommendations = await getHobbyRecommendations(id)

        res.status(200).json({
            friendRecommendations,
            hobbyRecommendations
        })
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}