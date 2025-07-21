// utils/fetchMenuData.ts

import { toast } from "react-toastify";
import { api } from "../api";

export const fetchMenuData = async ({
  restaurantId,
  page = 1,
  limit = 100,
  onSuccess,
  onError,
}) => {
  console.log(location.pathname.includes("view"));
  try {
    const res = await api.get(`/restaurants/${restaurantId}/menu`, {
      params: { page, limit },
    });

    console.log(res.data);

    if (onSuccess) {
      onSuccess(res.data);
    }
  } catch (error) {
    if (onError) {
      onError(error);
      toast.error("Error Loading Menu");
    }
  }
};
