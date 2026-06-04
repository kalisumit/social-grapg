import axios from "axios"

const API_URL = "http://localhost:5000/api";

export const getGraph = async () => {
    const response = await axios.get(`${API_URL}/graph`)

    return response.data
}