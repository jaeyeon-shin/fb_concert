// src/utils/useQueryParam.js

// useLocation 훅은 현재 브라우저의 URL 정보를 가져오는 데 사용됨
import { useLocation } from 'react-router-dom';

// 이 커스텀 훅은 URL의 쿼리 파라미터 중 특정 key에 해당하는 값을 반환함
export default function useQueryParam(key) {
  // 현재 URL에서 search 부분 (?id=abc123 같은 부분)을 가져옴
  const { search } = useLocation();

  // URLSearchParams 객체를 통해 쿼리 파라미터를 파싱함
  const params = new URLSearchParams(search);

  // key에 해당하는 값 반환 (예: useQueryParam("id") → "abc123")
  return params.get(key);
}
