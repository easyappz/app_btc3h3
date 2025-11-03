import instance from './axios';

function cleanParams(params) {
  const out = {};
  Object.keys(params || {}).forEach((k) => {
    const v = params[k];
    if (v !== undefined && v !== null && v !== '') {
      out[k] = v;
    }
  });
  return out;
}

export async function listListings(params = {}) {
  const query = cleanParams(params);
  const { data } = await instance.get('/api/catalog/listings/', { params: query });
  return data;
}

export async function getListing(id) {
  const { data } = await instance.get(`/api/catalog/listings/${id}/`);
  return data;
}

export async function createListing(payload) {
  const { data } = await instance.post('/api/catalog/listings/', payload);
  return data;
}

export async function updateListing(id, payload) {
  const { data } = await instance.patch(`/api/catalog/listings/${id}/`, payload);
  return data;
}

export async function deleteListing(id) {
  const { data } = await instance.delete(`/api/catalog/listings/${id}/`);
  return data;
}

export async function uploadImage(listingId, file, order) {
  const formData = new FormData();
  formData.append('image', file);
  if (order !== undefined && order !== null) {
    formData.append('order', String(order));
  }
  const { data } = await instance.post(`/api/catalog/listings/${listingId}/images/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteImage(imageId) {
  const { data } = await instance.delete(`/api/catalog/images/${imageId}/`);
  return data;
}

export async function toggleFavorite(listingId, isFavorite) {
  if (isFavorite) {
    const { data } = await instance.delete(`/api/catalog/listings/${listingId}/favorite/`);
    return data;
  }
  const { data } = await instance.post(`/api/catalog/listings/${listingId}/favorite/`);
  return data;
}

export async function listFavorites(params = {}) {
  const query = cleanParams(params);
  const { data } = await instance.get('/api/catalog/favorites/', { params: query });
  return data;
}

export default {
  listListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  uploadImage,
  deleteImage,
  toggleFavorite,
  listFavorites,
};
