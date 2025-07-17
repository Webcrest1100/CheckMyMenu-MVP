import axios from 'axios';


const handleSaveTemplate = async () => {
  try {
    const token = localStorage.getItem("token"); 
    const response = await axios.put(
      `http://localhost:5000/api/restaurants/${restaurant._id}/template`,
      { selectedTemplate },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );


    alert("Template saved successfully!");
  } catch (error) {
    console.error(error);
    alert("Error saving template");
  }
};



export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// automatically attach token if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


