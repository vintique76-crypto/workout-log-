export const ROUTINE_TEMPLATES = [
  {
    id: "full-body",
    name: "무분할 전신",
    description: "1개 루틴 — 매번 전신을 골고루. 헬스 입문자에게 추천",
    routines: [
      {
        name: "전신",
        exercises: [
          { name: "스쿼트", muscleGroup: "하체" },
          { name: "벤치프레스", muscleGroup: "가슴" },
          { name: "바벨 로우", muscleGroup: "등" },
          { name: "오버헤드 프레스", muscleGroup: "어깨" },
          { name: "플랭크", muscleGroup: "코어" },
        ],
      },
    ],
  },
  {
    id: "upper-lower",
    name: "상체/하체 분할",
    description: "2일 분할 — 상체 날, 하체 날",
    routines: [
      {
        name: "상체",
        exercises: [
          { name: "벤치프레스", muscleGroup: "가슴" },
          { name: "바벨 로우", muscleGroup: "등" },
          { name: "오버헤드 프레스", muscleGroup: "어깨" },
          { name: "바벨 컬", muscleGroup: "팔" },
        ],
      },
      {
        name: "하체",
        exercises: [
          { name: "스쿼트", muscleGroup: "하체" },
          { name: "루마니안 데드리프트", muscleGroup: "하체" },
          { name: "레그프레스", muscleGroup: "하체" },
          { name: "카프레이즈", muscleGroup: "하체" },
        ],
      },
    ],
  },
  {
    id: "5x5",
    name: "5x5 스트렝스",
    description: "2일 분할(A/B) — 무게를 꾸준히 늘리는 데 집중하는 초보 스트렝스 프로그램",
    routines: [
      {
        name: "5x5 - A",
        exercises: [
          { name: "스쿼트", muscleGroup: "하체" },
          { name: "벤치프레스", muscleGroup: "가슴" },
          { name: "바벨 로우", muscleGroup: "등" },
        ],
      },
      {
        name: "5x5 - B",
        exercises: [
          { name: "스쿼트", muscleGroup: "하체" },
          { name: "오버헤드 프레스", muscleGroup: "어깨" },
          { name: "데드리프트", muscleGroup: "등" },
        ],
      },
    ],
  },
  {
    id: "ppl",
    name: "PPL (푸시/풀/레그)",
    description: "3일 분할 — 미는 근육 / 당기는 근육 / 하체로 나눠서",
    routines: [
      {
        name: "Push (가슴·어깨·삼두)",
        exercises: [
          { name: "벤치프레스", muscleGroup: "가슴" },
          { name: "오버헤드 프레스", muscleGroup: "어깨" },
          { name: "사이드 레터럴 레이즈", muscleGroup: "어깨" },
          { name: "케이블 푸시다운", muscleGroup: "팔" },
        ],
      },
      {
        name: "Pull (등·이두)",
        exercises: [
          { name: "데드리프트", muscleGroup: "등" },
          { name: "바벨 로우", muscleGroup: "등" },
          { name: "랫풀다운", muscleGroup: "등" },
          { name: "바벨 컬", muscleGroup: "팔" },
        ],
      },
      {
        name: "Legs (하체)",
        exercises: [
          { name: "스쿼트", muscleGroup: "하체" },
          { name: "레그프레스", muscleGroup: "하체" },
          { name: "레그컬", muscleGroup: "하체" },
          { name: "카프레이즈", muscleGroup: "하체" },
        ],
      },
    ],
  },
];
