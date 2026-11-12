import { request } from './http.js';

const CART_URL = import.meta.env.VITE_CART_URL;

export const getCart = (userId) =>
  request(CART_URL, `/carts/${userId}`).then((res) => res.data);

export const addToCart = (userId, productId, quantity = 1) =>
  request(CART_URL, '/carts', {
    method: 'POST',
    body: {
      user_id: userId,
      product_id: productId,
      quantity,
    },
  }).then((res) => res.data);

export const updateCartItem = (itemId, quantity) =>
  request(CART_URL, `/carts/items/${itemId}`, {
    method: 'PUT',
    body: { quantity },
  }).then((res) => res.data);

export const removeCartItem = (itemId) =>
  request(CART_URL, `/carts/items/${itemId}`, {
    method: 'DELETE',
  });

export const clearCart = (userId) =>
  request(CART_URL, `/carts/${userId}`, {
    method: 'DELETE',
  });
