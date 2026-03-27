export const PRO_FEATURES = [
  { text: "도메인 분석 무제한", key: "unlimited_analysis" },
  { text: "AI 도메인 생성기 무제한", key: "unlimited_ai" },
  { text: "대량 분석 (100개, 무제한)", key: "unlimited_bulk" },
  { text: "도메인 비교 (10개)", key: "compare_10" },
  { text: "Ahrefs 트래픽, 트래픽 가치, 키워드", key: "ahrefs" },
  { text: "Moz Links, 스팸 점수", key: "moz" },
  { text: "Majestic Links, 참조 도메인", key: "majestic" },
  { text: "전체 낙찰 이력 열람", key: "full_history" },
  { text: "고도화 도메인 가치 평가", key: "advanced_value" },
  { text: "DNS/WHOIS/SSL/HTTP 무제한", key: "unlimited_tools" },
] as const;

export const FREE_LIMITS = [
  { text: "도메인 분석 1일 5회", key: "analysis_5" },
  { text: "AI 생성기 1일 3회", key: "ai_3" },
  { text: "대량 분석 1일 1회 (5개)", key: "bulk_1" },
  { text: "도메인 비교 2개", key: "compare_2" },
  { text: "기본 지표만 (DA/PA/DR/TF/CF)", key: "basic_metrics" },
  { text: "낙찰 이력 최근 24시간만", key: "history_24h" },
] as const;
