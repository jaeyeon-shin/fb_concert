import React from "react";

// 재사용 가능한 버튼 컴포넌트 정의
// props: icon(아이콘 이미지 경로), label(버튼 텍스트), onClick(클릭 시 실행할 함수)
const Button = ({ icon, label, onClick }) => {
  return (
    <button
      // 버튼 클릭 시 onClick 함수 실행
      onClick={onClick}
      // 버튼 스타일: 세로 정렬, 중앙 정렬, 클릭 시 외곽선 제거, 클릭 시 약간 튕기는 애니메이션 효과
      className="flex flex-col items-center space-y-2 focus:outline-none transition-transform duration-200"
    >
      {/* 아이콘 이미지 출력 */}
      <img
        src={icon} // 전달받은 아이콘 이미지 경로
        alt={label} // 접근성 향상을 위한 대체 텍스트
        // 반응형 크기 조정: 작은 화면(w-20), 중간(sm:w-24), 큰 화면(md:w-28)에서 이미지 크기 다르게
        className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain"
      />
      
      {/* 버튼 아래 텍스트 출력 */}
      <span
        className="text-gray-800 text-base sm:text-lg md:text-xl font-semibold tracking-wide"
      >
        {label} {/* 전달받은 텍스트(label) 표시 */}
      </span>
    </button>
  );
};

export default Button;
