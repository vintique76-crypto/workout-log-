export const ROUTINE_TEMPLATES = [
  {
    id: "bro-split",
    name: "5분할 (브로 스플릿)",
    description: "가슴/등/어깨/팔/하체를 하루씩 — 한국 헬스장에서 가장 흔한 분할 방식",
    routines: [
      {
        name: "가슴 day",
        exercises: [
          { name: "벤치프레스", muscleGroup: "가슴" },
          { name: "인클라인 벤치프레스", muscleGroup: "가슴" },
          { name: "덤벨 플라이", muscleGroup: "가슴" },
          { name: "케이블 크로스오버", muscleGroup: "가슴" },
          { name: "딥스", muscleGroup: "가슴" },
        ],
      },
      {
        name: "등 day",
        exercises: [
          { name: "데드리프트", muscleGroup: "등" },
          { name: "풀업", muscleGroup: "등" },
          { name: "바벨 로우", muscleGroup: "등" },
          { name: "랫풀다운", muscleGroup: "등" },
          { name: "시티드 로우", muscleGroup: "등" },
        ],
      },
      {
        name: "어깨 day",
        exercises: [
          { name: "오버헤드 프레스", muscleGroup: "어깨" },
          { name: "사이드 레터럴 레이즈", muscleGroup: "어깨" },
          { name: "프론트 레이즈", muscleGroup: "어깨" },
          { name: "리어 델트 플라이", muscleGroup: "어깨" },
          { name: "페이스 풀", muscleGroup: "어깨" },
        ],
      },
      {
        name: "팔 day",
        exercises: [
          { name: "바벨 컬", muscleGroup: "팔" },
          { name: "해머 컬", muscleGroup: "팔" },
          { name: "클로즈그립 벤치프레스", muscleGroup: "팔" },
          { name: "케이블 푸시다운", muscleGroup: "팔" },
          { name: "스컬크러셔", muscleGroup: "팔" },
        ],
      },
      {
        name: "하체 day",
        exercises: [
          { name: "스쿼트", muscleGroup: "하체" },
          { name: "레그프레스", muscleGroup: "하체" },
          { name: "루마니안 데드리프트", muscleGroup: "하체" },
          { name: "레그컬", muscleGroup: "하체" },
          { name: "카프레이즈", muscleGroup: "하체" },
        ],
      },
    ],
  },
  {
    id: "starting-strength",
    name: "스타팅 스트렝스",
    description: "마크 리피토(Mark Rippetoe)의 초보자용 프로그램 — A/B 교대, 3세트x5회, 매 세션 무게를 올리는 선형 발전",
    routines: [
      {
        name: "스타팅 스트렝스 - A",
        exercises: [
          { name: "스쿼트", muscleGroup: "하체" },
          { name: "벤치프레스", muscleGroup: "가슴" },
          { name: "데드리프트", muscleGroup: "등" },
        ],
      },
      {
        name: "스타팅 스트렝스 - B",
        exercises: [
          { name: "스쿼트", muscleGroup: "하체" },
          { name: "오버헤드 프레스", muscleGroup: "어깨" },
          { name: "바벨 로우", muscleGroup: "등" },
        ],
      },
    ],
  },
  {
    id: "stronglifts-5x5",
    name: "스트롱리프츠 5x5",
    description: "StrongLifts 5×5 — A/B 교대, 주 3회, 데드리프트만 1세트 나머지는 5세트x5회로 매 세션 스쿼트",
    routines: [
      {
        name: "스트롱리프츠 - A",
        exercises: [
          { name: "스쿼트", muscleGroup: "하체" },
          { name: "벤치프레스", muscleGroup: "가슴" },
          { name: "바벨 로우", muscleGroup: "등" },
        ],
      },
      {
        name: "스트롱리프츠 - B",
        exercises: [
          { name: "스쿼트", muscleGroup: "하체" },
          { name: "오버헤드 프레스", muscleGroup: "어깨" },
          { name: "데드리프트", muscleGroup: "등" },
        ],
      },
    ],
  },
  {
    id: "phul",
    name: "PHUL (파워+하이퍼트로피)",
    description: "Power Hypertrophy Upper Lower — 상/하체를 각각 저중량-고중량 이틀씩, 주 4일",
    routines: [
      {
        name: "Upper Power",
        exercises: [
          { name: "벤치프레스", muscleGroup: "가슴" },
          { name: "바벨 로우", muscleGroup: "등" },
          { name: "오버헤드 프레스", muscleGroup: "어깨" },
          { name: "풀업", muscleGroup: "등" },
          { name: "바벨 컬", muscleGroup: "팔" },
        ],
      },
      {
        name: "Lower Power",
        exercises: [
          { name: "스쿼트", muscleGroup: "하체" },
          { name: "데드리프트", muscleGroup: "등" },
          { name: "레그프레스", muscleGroup: "하체" },
          { name: "카프레이즈", muscleGroup: "하체" },
        ],
      },
      {
        name: "Upper Hypertrophy",
        exercises: [
          { name: "인클라인 벤치프레스", muscleGroup: "가슴" },
          { name: "랫풀다운", muscleGroup: "등" },
          { name: "사이드 레터럴 레이즈", muscleGroup: "어깨" },
          { name: "케이블 푸시다운", muscleGroup: "팔" },
          { name: "덤벨 컬", muscleGroup: "팔" },
        ],
      },
      {
        name: "Lower Hypertrophy",
        exercises: [
          { name: "프론트 스쿼트", muscleGroup: "하체" },
          { name: "루마니안 데드리프트", muscleGroup: "하체" },
          { name: "레그익스텐션", muscleGroup: "하체" },
          { name: "레그컬", muscleGroup: "하체" },
        ],
      },
    ],
  },
  {
    id: "ppl",
    name: "PPL (푸시/풀/레그)",
    description: "3일 분할 — 미는 근육 / 당기는 근육 / 하체로 나눠서, 중급자에게 인기 많은 구성",
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
  {
    id: "wendler-531",
    name: "웬들러 5/3/1",
    description: "짐 웬들러(Jim Wendler)의 프로그램 — 스쿼트/벤치/데드리프트/오버헤드프레스를 각각 하루씩, 메인 리프트에 집중하고 보조 운동은 가볍게",
    routines: [
      {
        name: "5/3/1 - 스쿼트 day",
        exercises: [
          { name: "스쿼트", muscleGroup: "하체" },
          { name: "레그프레스", muscleGroup: "하체" },
          { name: "행잉 레그레이즈", muscleGroup: "코어" },
        ],
      },
      {
        name: "5/3/1 - 벤치프레스 day",
        exercises: [
          { name: "벤치프레스", muscleGroup: "가슴" },
          { name: "바벨 로우", muscleGroup: "등" },
          { name: "케이블 푸시다운", muscleGroup: "팔" },
        ],
      },
      {
        name: "5/3/1 - 데드리프트 day",
        exercises: [
          { name: "데드리프트", muscleGroup: "등" },
          { name: "풀업", muscleGroup: "등" },
          { name: "플랭크", muscleGroup: "코어" },
        ],
      },
      {
        name: "5/3/1 - 오버헤드프레스 day",
        exercises: [
          { name: "오버헤드 프레스", muscleGroup: "어깨" },
          { name: "랫풀다운", muscleGroup: "등" },
          { name: "바벨 컬", muscleGroup: "팔" },
        ],
      },
    ],
  },
  {
    id: "arnold-split",
    name: "아놀드 스플릿",
    description: "아놀드 슈워제네거의 6일 분할 — 가슴+등, 어깨+팔, 하체를 주 2회씩 (고급자용, 볼륨이 많음)",
    routines: [
      {
        name: "가슴+등",
        exercises: [
          { name: "벤치프레스", muscleGroup: "가슴" },
          { name: "바벨 로우", muscleGroup: "등" },
          { name: "인클라인 벤치프레스", muscleGroup: "가슴" },
          { name: "풀업", muscleGroup: "등" },
          { name: "덤벨 플라이", muscleGroup: "가슴" },
        ],
      },
      {
        name: "어깨+팔",
        exercises: [
          { name: "오버헤드 프레스", muscleGroup: "어깨" },
          { name: "사이드 레터럴 레이즈", muscleGroup: "어깨" },
          { name: "바벨 컬", muscleGroup: "팔" },
          { name: "스컬크러셔", muscleGroup: "팔" },
          { name: "리어 델트 플라이", muscleGroup: "어깨" },
        ],
      },
      {
        name: "하체",
        exercises: [
          { name: "스쿼트", muscleGroup: "하체" },
          { name: "레그프레스", muscleGroup: "하체" },
          { name: "루마니안 데드리프트", muscleGroup: "하체" },
          { name: "레그컬", muscleGroup: "하체" },
          { name: "카프레이즈", muscleGroup: "하체" },
        ],
      },
    ],
  },
];
