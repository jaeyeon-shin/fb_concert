// React 라이브러리와 ReactDOM을 불러옴
import React from "react";
import ReactDOM from "react-dom/client";

// 전역 스타일시트 (Tailwind 포함되어 있을 가능성 높음)
import "./index.css";

// 앱의 루트 컴포넌트인 App.jsx 불러오기
import App from "./App";

// HTML의 <div id="root">에 리액트 앱을 렌더링함
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* React의 개발 모드에서 에러와 경고를 더 잘 감지하게 해주는 모드 */}
    <App /> {/* 실제 앱 시작 컴포넌트 */}
  </React.StrictMode>
);
