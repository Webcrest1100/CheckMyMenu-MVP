// utils/fetchMenuData.ts

import { api } from "../api";

export const fetchMenuData = async ({
  restaurantId,
  page = 1,
  limit = 100,
  onSuccess,
  onError,
}) => {
  try {
    const res = await api.get(`/restaurants/${restaurantId}/menu`, {
      params: { page, limit },
    });

    console.log(res.data);

    if (onSuccess) {
      onSuccess(res.data);
    }
  } catch (error) {
    if (error.status === 401) {
      window.location.href = "/login";
    }
    if (onError) {
      onError(error);
    }
  }
};
