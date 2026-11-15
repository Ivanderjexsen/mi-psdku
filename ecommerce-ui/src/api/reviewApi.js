import { request } from './http.js';

const REVIEW_URL = import.meta.env.VITE_REVIEW_URL;

export const getProductReviews = (productId) =>
  request(REVIEW_URL, `/reviews/product/${productId}`).then(
    (res) => res.data,
  );

export const createReview = ({ productId, userId, rating, comment }) =>
  request(REVIEW_URL, '/reviews', {
    method: 'POST',
    body: {
      product_id: productId,
      user_id: userId,
      rating,
      comment,
    },
  }).then((res) => res.data);

export const deleteReview = (reviewId, userId) =>
  request(
    REVIEW_URL,
    `/reviews/${encodeURIComponent(reviewId)}?user_id=${encodeURIComponent(userId)}`,
    { method: 'DELETE' },
  ).then((res) => res.data);
