import api from './api.js';
import { products as fallbackProducts } from '../data/mockData.js';

export const fetchShopProducts = async () => {
  try {
    const { data } = await api.get('/shop/products');
    return data.products?.length ? data.products : fallbackProducts;
  } catch {
    return fallbackProducts;
  }
};

export const fetchShopTestimonials = async () => {
  const { data } = await api.get('/shop/testimonials');
  return data.testimonials || [];
};
