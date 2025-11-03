import instance from './axios';

export async function listSellerReviews(userId, params = {}) {
  const { data } = await instance.get(`/api/reviews/seller/${userId}/`, { params });
  return data;
}

export async function createReview(payload) {
  const { data } = await instance.post('/api/reviews/', payload);
  return data;
}

export async function deleteReview(id) {
  const { data } = await instance.delete(`/api/reviews/${id}/`);
  return data;
}

export default { listSellerReviews, createReview, deleteReview };
