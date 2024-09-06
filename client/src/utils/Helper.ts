export const calculateWordCount = (text: string): number => {
    return text.split(/\s+/).filter(word => word.length > 0).length
}

export const baseUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000";