import { request } from './http.js';

const PRODUCT_URL = import.meta.env.VITE_PRODUCT_URL;

export const getProducts = () =>
  request(PRODUCT_URL, '/products').then((res) => res.data);

export const getProduct = (id) =>
  request(PRODUCT_URL, `/products/${id}`).then((res) => res.data);
