import { createContext, useContext, type Dispatch, type SetStateAction } from 'react';
export const VisitReviews = createContext<{
  reviewedIds: string[];
  setReviewedIds: Dispatch<SetStateAction<string[]>>;
}>({ reviewedIds: [], setReviewedIds: () => {} });
export const useVisitReviews = () => useContext(VisitReviews);
