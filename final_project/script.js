// 현재 날짜를 형식에 맞게 표시하는 함수
function updateDate() {
   const dateElement = document.getElementById('current-date');
   const today = new Date();

   // 년, 월, 일 가져오기
   const year = today.getFullYear();
   const month = String(today.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1 필요
   const day = String(today.getDate()).padStart(2, '0');

   // 요일 가져오기
   const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
   const dayOfWeek = daysOfWeek[today.getDay()];

   // 형식에 맞게 날짜 생성
   const formattedDate = `${year} . ${month} . ${day} ${dayOfWeek}`;

   // <h1> 태그에 날짜 설정
   if (dateElement) {
      dateElement.textContent = formattedDate;
   }
}

// 페이지가 로드되면 날짜 업데이트 함수 실행
window.onload = updateDate;