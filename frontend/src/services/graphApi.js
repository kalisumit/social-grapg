import axios from "axios"

const API_URL = "https://social-graph.onrender.com/api";

export const getGraph = async () => {
    const response = await axios.get(`${API_URL}/graph`)

    return response.data
}