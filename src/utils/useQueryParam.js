// src/utils/useQueryParam.js
import { useLocation } from 'react-router-dom';

export default function useQueryParam(key) {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  return params.get(key);
}