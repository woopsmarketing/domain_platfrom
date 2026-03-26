import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "도메인 스팸 점수 확인 방법 — 내 도메인이 스팸으로 분류되고 있는지 점검하기 — 도메인체커",
  description:
    "도메인 스팸 점수(Spam Score)가 무엇인지, 왜 높아지는지, 어떻게 확인하고 낮출 수 있는지 실무 기준으로 정리했습니다. 초보자도 따라 할 수 있는 스팸 점수 체크 가이드.",
  keywords: [
    "도메인 스팸 점수",
    "Spam Score",
    "스팸 점수 확인",
    "도메인 스팸 확인",
    "백링크 스팸",
    "디스어보우",
    "도메인 신뢰도",
    "SEO 스팸 점수",
    "중고 도메인 스팸",
    "도메인 품질 확인",
  ],
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:
      "도메인 스팸 점수 확인 방법 — 내 도메인이 스팸으로 분류되고 있는지 점검하기",
    description:
      "도메인 스팸 점수(Spam Score)가 무엇인지, 왜 높아지는지, 어떻게 확인하고 낮출 수 있는지 실무 기준으로 정리했습니다.",
    author: { "@type": "Organization", name: "도메인체커" },
    publisher: {
      "@type": "Organization",
      name: "도메인체커",
      logo: {
        "@type": "ImageObject",
        url: "https://domainchecker.co.kr/icon.svg",
      },
    },
    mainEntityOfPage:
      "https://domainchecker.co.kr/blog/domain-spam-score-check",
    datePublished: "2026-03-26",
    dateModified: "2026-03-26",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "스팸 점수란 정확히 무엇인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "스팸 점수는 도메인이 검색엔진에서 스팸으로 분류될 가능성을 0~100% 사이로 수치화한 지표입니다. 백링크 품질, 콘텐츠 상태, 사이트 구조 등 27가지 이상의 스팸 플래그를 종합해 산출하며, 검색엔진 공식 지표가 아닌 외부 분석 도구의 추정 점수입니다.",
        },
      },
      {
        "@type": "Question",
        name: "스팸 점수가 높으면 검색 순위가 떨어지나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "스팸 점수 자체가 Google 순위에 직접 반영되지는 않습니다. 다만 스팸 점수가 높다는 것은 저품질 백링크가 많거나 사이트 신뢰도에 문제가 있다는 신호이므로, 간접적으로 검색 순위에 부정적 영향을 줄 수 있습니다.",
        },
      },
      {
        "@type": "Question",
        name: "스팸 점수를 무료로 확인할 수 있나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "기본적인 도메인 지표(DA, DR 등)는 무료 도구로 확인할 수 있습니다. 스팸 점수는 보통 유료 또는 Pro 등급에서 제공되는 심화 지표입니다. 도메인체커에서도 기본 분석은 무료이며, 스팸 점수는 Pro 기능으로 제공됩니다.",
        },
      },
      {
        "@type": "Question",
        name: "디스어보우(Disavow)를 하면 스팸 점수가 바로 내려가나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "디스어보우를 제출한다고 즉시 점수가 변하지는 않습니다. Google이 해당 링크를 처리하는 데 수 주에서 수 개월이 걸릴 수 있으며, 외부 분석 도구의 점수 반영에도 시간이 필요합니다. 꾸준한 모니터링이 중요합니다.",
        },
      },
      {
        "@type": "Question",
        name: "새 도메인도 스팸 점수가 높을 수 있나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "드물지만 가능합니다. 새 도메인이라도 스팸 사이트에서 일방적으로 백링크를 보내면 점수가 올라갈 수 있습니다. 이를 '네거티브 SEO'라고 부르며, 발견 즉시 디스어보우로 대응하는 것이 좋습니다.",
        },
      },
    ],
  },
];

export default function DomainSpamScoreCheckPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> 블로그 목록
      </Link>

      <h1 className="text-3xl font-bold tracking-tight leading-tight">
        도메인 스팸 점수 확인 방법 — 내 도메인이 스팸으로 분류되고 있는지 점검하기
      </h1>

      {/* 날짜 + 읽는 시간 */}
      <div className="blog-meta">
        <time dateTime="2026-03-26">2026년 3월 26일</time>
        <span aria-hidden="true">·</span>
        <span>8분 읽기</span>
      </div>

      {/* 목차(TOC) */}
      <nav className="blog-toc">
        <p className="blog-toc-title">목차</p>
        <ol className="space-y-1.5">
          <li><a href="#what-is-spam-score" className="text-primary hover:underline">스팸 점수란 무엇인가</a></li>
          <li><a href="#spam-vs-other-metrics" className="text-primary hover:underline">스팸 점수 vs 다른 지표 비교</a></li>
          <li><a href="#8-causes" className="text-primary hover:underline">스팸 점수가 높아지는 8가지 원인</a></li>
          <li><a href="#how-to-check" className="text-primary hover:underline">스팸 점수 확인 3단계 가이드</a></li>
          <li><a href="#score-table" className="text-primary hover:underline">스팸 점수 기준표</a></li>
          <li><a href="#reduce-5-steps" className="text-primary hover:underline">스팸 점수 낮추기 실전 5단계</a></li>
          <li><a href="#used-domain-checklist" className="text-primary hover:underline">중고 도메인 구매 시 체크리스트</a></li>
          <li><a href="#common-mistakes" className="text-primary hover:underline">자주 하는 실수 3가지</a></li>
          <li><a href="#summary" className="text-primary hover:underline">요약</a></li>
          <li><a href="#faq" className="text-primary hover:underline">FAQ</a></li>
        </ol>
      </nav>

      {/* 본문 */}
      <div className="blog-prose mt-10">

        {/* 1. 스팸 점수란 무엇인가 */}
        <section>
          <h2 id="what-is-spam-score" className="mt-12 mb-4 text-2xl font-bold text-foreground">
            1. 스팸 점수란 무엇인가
          </h2>
          <p className="text-base leading-7 text-muted-foreground">
            스팸 점수(Spam Score)는 특정 도메인이 검색엔진에서 스팸으로 분류될 가능성을 수치화한 지표입니다. 일반적으로 0%에서 100% 사이로 표시되며, 숫자가 높을수록 스팸 특성이 강하다고 판단됩니다.
          </p>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            이 지표는 도메인의 백링크 패턴, 콘텐츠 품질, 사이트 구조 등 여러 신호를 종합해 산출합니다. 검색엔진이 직접 제공하는 점수가 아니라 외부 분석 도구가 추정하는 위험도 지표라는 점을 이해해야 합니다.
          </p>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            대표적인 스팸 점수 산출 방식에서는 <strong className="font-semibold text-foreground">27가지 스팸 플래그</strong>를 확인합니다. 여기에는 도메인에 연결된 백링크의 품질, 콘텐츠의 독창성, 사이트의 기술적 구조, 도메인 등록 정보의 신뢰도 등이 포함됩니다. 이 27가지 플래그 중 몇 개에 해당하는지에 따라 최종 스팸 점수가 결정됩니다.
          </p>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            쉽게 비유하면, 스팸 점수는 도메인의 &quot;신용등급&quot;과 비슷합니다. 신용등급이 낮으면 대출이 어렵듯, 스팸 점수가 높으면 검색엔진이 해당 사이트를 신뢰하기 어렵다고 볼 수 있습니다. 도메인 투자자라면 구매 전에 반드시 확인해야 하는 핵심 지표 중 하나입니다.
          </p>
        </section>

        {/* 2. 스팸 점수 vs 다른 지표 비교 */}
        <section>
          <h2 id="spam-vs-other-metrics" className="mt-12 mb-4 text-2xl font-bold text-foreground">
            2. 스팸 점수 vs 다른 지표 비교
          </h2>
          <p className="text-base leading-7 text-muted-foreground">
            스팸 점수는 다른 SEO 지표와 함께 종합적으로 해석해야 합니다. 각 지표가 측정하는 관점이 다르기 때문입니다.
          </p>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            <strong className="font-semibold text-foreground">DA(Domain Authority)와의 관계:</strong>{" "}
            <Link href="/blog/what-is-da" className="text-primary hover:underline">DA</Link>는 도메인의 검색 순위 가능성을 0~100으로 예측하는 지표입니다. DA가 높아도 스팸 점수가 높으면 그 DA가 인위적으로 부풀려졌을 가능성이 큽니다. 반대로 DA가 낮더라도 스팸 점수가 0%에 가까우면 건강한 도메인입니다.
          </p>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            <strong className="font-semibold text-foreground">DR(Domain Rating)과의 차이:</strong>{" "}
            DR은 백링크 프로필의 강도를 측정합니다. 스팸 점수는 백링크의 &quot;양&quot;이 아닌 &quot;질&quot;을 평가한다는 점이 다릅니다. DR이 60이라도 저품질 백링크가 대부분이면 스팸 점수는 높아질 수 있습니다.
          </p>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            <strong className="font-semibold text-foreground">Trust Flow와 비교:</strong>{" "}
            Trust Flow는 백링크의 신뢰도를 측정하는 양의 지표(높을수록 좋음)인 반면, 스팸 점수는 위험도를 측정하는 음의 지표(낮을수록 좋음)입니다. 두 지표를 함께 보면 도메인의 전반적 건강 상태를 더 정확하게 파악할 수 있습니다.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">지표</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">측정 대상</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">범위</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">높을수록</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 font-medium text-foreground">스팸 점수</td>
                  <td className="px-4 py-3 text-muted-foreground">스팸 분류 위험도</td>
                  <td className="px-4 py-3 text-muted-foreground">0~100%</td>
                  <td className="px-4 py-3 text-red-600 dark:text-red-400 font-medium">나쁨</td>
                </tr>
                <tr className="border-b border-border bg-muted/20">
                  <td className="px-4 py-3 font-medium text-foreground">DA</td>
                  <td className="px-4 py-3 text-muted-foreground">검색 순위 가능성</td>
                  <td className="px-4 py-3 text-muted-foreground">0~100</td>
                  <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-medium">좋음</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 font-medium text-foreground">DR</td>
                  <td className="px-4 py-3 text-muted-foreground">백링크 강도</td>
                  <td className="px-4 py-3 text-muted-foreground">0~100</td>
                  <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-medium">좋음</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-foreground">Trust Flow</td>
                  <td className="px-4 py-3 text-muted-foreground">백링크 신뢰도</td>
                  <td className="px-4 py-3 text-muted-foreground">0~100</td>
                  <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-medium">좋음</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-base leading-7 text-muted-foreground">
            핵심은 단일 지표만으로 도메인을 평가하면 안 된다는 것입니다. DA가 50이고 스팸 점수가 2%인 도메인이, DA 70에 스팸 점수 65%인 도메인보다 실질적으로 더 가치 있을 수 있습니다.
          </p>
        </section>

        {/* 3. 스팸 점수가 높아지는 8가지 원인 */}
        <section>
          <h2 id="8-causes" className="mt-12 mb-4 text-2xl font-bold text-foreground">
            3. 스팸 점수가 높아지는 8가지 원인
          </h2>
          <p className="text-base leading-7 text-muted-foreground">
            스팸 점수가 올라가는 데는 여러 원인이 있습니다. 아래는 실무에서 자주 발견되는 8가지 패턴입니다.
          </p>

          <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground">
            (1) 저품질 백링크 과다
          </h3>
          <p className="text-base leading-7 text-muted-foreground">
            가장 흔한 원인입니다. 출처가 불분명한 사이트, 링크팜, 자동 생성된 디렉토리에서 대량으로 백링크가 걸려 있으면 스팸 점수가 급격히 올라갑니다. 특히 중고 도메인을 구매했을 때 이전 소유자가 남긴 저품질 링크가 문제가 되는 경우가 많습니다. 수백, 수천 개의 백링크가 달려 있는데 대부분이 DA 5 이하의 사이트에서 왔다면 위험 신호입니다.
          </p>

          <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground">
            (2) 콘텐츠 부재 또는 저품질
          </h3>
          <p className="text-base leading-7 text-muted-foreground">
            도메인은 존재하는데 실제 콘텐츠가 거의 없거나, 자동 생성된 텍스트로 채워져 있는 경우입니다. 검색엔진은 이런 사이트를 스팸 가능성이 높다고 판단합니다. 파킹된 도메인이나 &quot;Lorem ipsum&quot;만 있는 페이지가 대표적입니다.
          </p>

          <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground">
            (3) 비정상적 앵커 텍스트 분포
          </h3>
          <p className="text-base leading-7 text-muted-foreground">
            백링크의 앵커 텍스트가 지나치게 특정 키워드에 집중되어 있으면 인위적 링크 조작으로 의심받을 수 있습니다. 자연스러운 링크 프로필이라면 브랜드명, URL, 다양한 키워드가 골고루 섞여야 합니다. 예를 들어, 모든 백링크의 앵커 텍스트가 &quot;최저가 보험&quot;이라면 명백한 조작 신호입니다.
          </p>

          <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground">
            (4) 과거 스팸 이력
          </h3>
          <p className="text-base leading-7 text-muted-foreground">
            도메인이 과거에 스팸 사이트로 운영된 적이 있으면, 소유자가 바뀌어도 그 흔적이 남아 있을 수 있습니다. 이런 이력은{" "}
            <Link href="/" className="text-primary hover:underline">
              Wayback Machine
            </Link>
            이나 도메인 분석 도구를 통해 확인할 수 있습니다. 과거에 온라인 카지노, 성인 사이트, 불법 약국 등으로 운영된 이력이 있으면 스팸 점수가 높게 잡힙니다.
          </p>

          <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground">
            (5) PBN(Private Blog Network) 연결
          </h3>
          <p className="text-base leading-7 text-muted-foreground">
            PBN은 검색 순위를 조작하기 위해 만들어진 사설 블로그 네트워크입니다. 동일한 호스팅 IP, 유사한 사이트 구조, 상호 링크 패턴 등으로 PBN이 감지되면 연결된 모든 도메인의 스팸 점수가 올라갑니다. 특히 도메인을 구매한 뒤 PBN에서 온 백링크가 발견되면, 이전 소유자가 SEO 조작에 사용했을 가능성이 높습니다.
          </p>

          <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground">
            (6) 외국어 스팸 백링크
          </h3>
          <p className="text-base leading-7 text-muted-foreground">
            한국어 사이트인데 중국어, 러시아어, 터키어 등 관련 없는 언어권에서 대량의 백링크가 들어오는 경우입니다. 이런 패턴은 자동화된 스팸 봇이 무차별적으로 링크를 건 것이므로 스팸 점수 상승의 직접적 원인이 됩니다. 백링크 프로필에서 출처 국가/언어 분포를 반드시 확인해야 합니다.
          </p>

          <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground">
            (7) 리다이렉트 체인
          </h3>
          <p className="text-base leading-7 text-muted-foreground">
            도메인이 여러 번의 리다이렉트(301, 302)를 거쳐 최종 사이트에 도달하는 구조는 스팸 점수를 높입니다. 특히 중고 도메인이 과거에 다른 도메인으로 리다이렉트되었던 이력이 있으면, 그 리다이렉트 체인에 포함된 사이트들의 스팸 점수까지 영향을 받을 수 있습니다. 리다이렉트가 3단계 이상 쌓이면 검색엔진이 의심을 하기 시작합니다.
          </p>

          <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground">
            (8) 도메인 나이와 히스토리 단절
          </h3>
          <p className="text-base leading-7 text-muted-foreground">
            도메인이 등록된 지 오래되었는데 중간에 몇 년간 비어 있었거나, 소유자가 여러 번 바뀐 이력이 있으면 스팸 점수에 부정적입니다. 특히 &quot;drop-catch&quot;(만료 후 재등록)를 반복한 도메인은 스팸 목적으로 사용되었을 가능성이 높다고 판단됩니다. Whois 이력에서 소유자 변경 빈도를 확인하는 것이 중요합니다.
          </p>
        </section>

        {/* 4. 스팸 점수 확인 3단계 가이드 */}
        <section>
          <h2 id="how-to-check" className="mt-12 mb-4 text-2xl font-bold text-foreground">
            4. 스팸 점수 확인 3단계 가이드
          </h2>
          <p className="text-base leading-7 text-muted-foreground">
            스팸 점수를 체계적으로 확인하는 방법을 3단계로 정리했습니다. 빠른 확인부터 심층 분석까지 순서대로 진행하세요.
          </p>

          <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground">
            1단계: 도메인 분석 도구로 빠른 확인
          </h3>
          <p className="text-base leading-7 text-muted-foreground">
            가장 간편한 방법입니다.{" "}
            <Link href="/" className="text-primary hover:underline">
              도메인체커
            </Link>
            처럼 도메인명만 입력하면 DA, DR 등 주요 SEO 지표와 함께 도메인의 전반적 건강 상태를 확인할 수 있는 도구를 사용하면 됩니다. 몇 초 안에 도메인의 기본적인 신뢰도를 파악할 수 있으므로, 중고 도메인을 여러 개 비교할 때 특히 유용합니다. 스팸 점수와 같은 심화 지표는 Pro 등급에서 확인할 수 있습니다.
          </p>

          <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground">
            2단계: 백링크 프로필 수동 점검
          </h3>
          <p className="text-base leading-7 text-muted-foreground">
            1단계에서 의심스러운 결과가 나왔다면, 백링크 목록을 직접 확인합니다. 구체적으로 확인할 항목은 다음과 같습니다.
          </p>
          <ul className="mt-3 space-y-2 pl-6 list-disc text-base leading-7 text-muted-foreground">
            <li>백링크 출처 사이트의 DA가 극단적으로 낮지 않은지 (DA 5 이하 대량 존재)</li>
            <li>같은 IP 대역에서 다수의 링크가 오지 않는지 (PBN 의심)</li>
            <li>앵커 텍스트가 특정 키워드에 80% 이상 집중되지 않는지</li>
            <li>출처 사이트의 언어/주제가 내 사이트와 관련이 있는지</li>
            <li>최근 급격히 증가한 백링크가 없는지 (단기간 대량 링크빌딩)</li>
          </ul>

          <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground">
            3단계: Google Search Console로 교차 검증
          </h3>
          <p className="text-base leading-7 text-muted-foreground">
            Google Search Console의 &quot;링크&quot; 보고서에서 외부 링크를 확인합니다. 직접적인 스팸 점수는 제공하지 않지만, Google이 인식하고 있는 실제 백링크 데이터를 볼 수 있어 외부 도구와 교차 검증하는 데 유용합니다. &quot;상위 링크 사이트&quot; 목록에서 의심스러운 출처가 있는지 확인하세요.
          </p>

          <blockquote className="mt-6 border-l-4 border-primary/50 bg-muted/30 py-3 px-4 italic text-base leading-7 text-muted-foreground rounded-r-lg">
            실무 팁: 1단계로 빠르게 전체 스팸 점수를 확인한 뒤, 점수가 30%를 넘으면 2단계와 3단계를 병행해 원인을 구체적으로 파악하는 순서를 추천합니다.
          </blockquote>
        </section>

        {/* 5. 스팸 점수 기준표 */}
        <section>
          <h2 id="score-table" className="mt-12 mb-4 text-2xl font-bold text-foreground">
            5. 스팸 점수 기준표 — 몇 점부터 위험한가
          </h2>
          <p className="text-base leading-7 text-muted-foreground mb-4">
            스팸 점수의 위험 수준을 구간별로 정리하면 다음과 같습니다.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">구간</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">의미</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">조치</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 font-medium text-foreground">0~30%</td>
                  <td className="px-4 py-3 text-muted-foreground">안전</td>
                  <td className="px-4 py-3 text-muted-foreground">특별한 조치 불필요. 정기 모니터링만 유지</td>
                </tr>
                <tr className="border-b border-border bg-muted/20">
                  <td className="px-4 py-3 font-medium text-foreground">31~60%</td>
                  <td className="px-4 py-3 text-muted-foreground">주의</td>
                  <td className="px-4 py-3 text-muted-foreground">백링크 프로필 점검 권장. 저품질 링크 식별 시작</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-foreground">61~100%</td>
                  <td className="px-4 py-3 text-muted-foreground">위험</td>
                  <td className="px-4 py-3 text-muted-foreground">즉시 원인 파악 + 디스어보우 검토. 중고 도메인이라면 구매 재고</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-base leading-7 text-muted-foreground">
            다만 스팸 점수는 절대적인 기준이 아닙니다. 30% 이하라도 특정 저품질 링크가 문제가 될 수 있고, 60% 이상이라도 일시적 요인일 수 있습니다. 중요한 것은 <strong className="font-semibold text-foreground">추세와 원인 파악</strong>입니다. 지난달 10%였던 점수가 이번 달 45%로 급등했다면, 절대값보다 변화 폭이 더 중요한 신호입니다.
          </p>
        </section>

        {/* 6. 스팸 점수 낮추기 실전 5단계 */}
        <section>
          <h2 id="reduce-5-steps" className="mt-12 mb-4 text-2xl font-bold text-foreground">
            6. 스팸 점수 낮추기 실전 5단계
          </h2>
          <p className="text-base leading-7 text-muted-foreground">
            스팸 점수가 높다면 아래 순서대로 점검하고 조치하세요. 각 단계는 이전 단계의 결과에 기반하므로 순서를 지키는 것이 중요합니다.
          </p>

          <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground">
            1단계: 백링크 목록 전체 확인
          </h3>
          <p className="text-base leading-7 text-muted-foreground">
            현재 도메인에 연결된 모든 외부 링크를 확인합니다. 도메인 분석 도구나 Google Search Console에서 목록을 추출하세요. 이때 중요한 것은 <strong className="font-semibold text-foreground">전체 목록</strong>을 확보하는 것입니다. 상위 100개만 보면 저품질 링크가 숨어 있을 수 있습니다. CSV 형태로 내보내서 스프레드시트에서 정리하면 효율적입니다.
          </p>

          <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground">
            2단계: 저품질 링크 식별 및 분류
          </h3>
          <p className="text-base leading-7 text-muted-foreground">
            아래 특징을 가진 링크를 골라내세요.
          </p>
          <ul className="mt-3 space-y-2 pl-6 list-disc text-base leading-7 text-muted-foreground">
            <li>출처 사이트의{" "}
              <Link href="/blog/what-is-da" className="text-primary hover:underline">
                DA(도메인 권위도)
              </Link>
              가 극단적으로 낮음 (5 이하)
            </li>
            <li>링크가 자동 생성된 디렉토리나 댓글에서 발생</li>
            <li>사이트 언어나 주제가 내 사이트와 전혀 관련 없음</li>
            <li>동일 IP 대역에서 대량으로 발생한 링크</li>
            <li>출처 사이트 자체가 이미 비활성화되었거나 파킹 상태</li>
          </ul>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            식별된 링크를 &quot;제거 요청 대상&quot;과 &quot;디스어보우 대상&quot;으로 분류하면 다음 단계가 수월해집니다.
          </p>

          <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground">
            3단계: 링크 제거 요청 또는 디스어보우(Disavow)
          </h3>
          <p className="text-base leading-7 text-muted-foreground">
            저품질 링크의 출처 사이트 운영자에게 링크 제거를 요청하는 것이 우선입니다. 이메일이나 연락처를 찾아 정중하게 요청하세요. 응답이 없거나 제거가 불가능한 경우, Google의 디스어보우 도구를 통해 해당 링크를 무시하도록 요청할 수 있습니다. 디스어보우 파일은 도메인 단위로 작성하는 것이 일반적입니다.
          </p>

          <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground">
            4단계: 콘텐츠 보강
          </h3>
          <p className="text-base leading-7 text-muted-foreground">
            사이트에 유용한 콘텐츠를 지속적으로 추가하세요. 양질의 콘텐츠가 쌓이면 전체적인 사이트 신뢰도가 올라가고, 상대적으로 스팸 신호의 비중이 줄어듭니다. 특히 원본 콘텐츠(다른 곳에서 복사하지 않은 독창적 글), 전문성이 드러나는 심화 콘텐츠, 사용자에게 실질적 가치를 제공하는 도구나 데이터가 효과적입니다.
          </p>

          <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground">
            5단계: 정기적 모니터링
          </h3>
          <p className="text-base leading-7 text-muted-foreground">
            스팸 점수는 한 번 낮추고 끝이 아닙니다. 새로운 저품질 백링크가 언제든 생길 수 있으므로, <strong className="font-semibold text-foreground">월 1회</strong> 정도 정기적으로 확인하는 습관이 필요합니다. 특히 네거티브 SEO 공격을 받을 수 있는 경쟁이 심한 분야라면 더 자주 모니터링하는 것이 좋습니다. 점수 변화를 기록해두면 추세를 파악하는 데 도움이 됩니다.
          </p>
        </section>

        {/* 7. 중고 도메인 구매 시 체크리스트 */}
        <section>
          <h2 id="used-domain-checklist" className="mt-12 mb-4 text-2xl font-bold text-foreground">
            7. 중고 도메인 구매 시 체크리스트
          </h2>
          <p className="text-base leading-7 text-muted-foreground">
            도메인 투자나 프로젝트를 위해 중고 도메인을 구매할 때, 스팸 점수 확인은 필수입니다. 겉보기에 DA가 높고 백링크가 많아 보이는 도메인이라도, 스팸 점수가 높다면 그 지표들이 인위적으로 부풀려졌을 가능성이 있습니다. 아래 7가지 항목을 구매 전에 반드시 점검하세요.
          </p>

          <ol className="mt-4 space-y-3 pl-6 list-decimal text-base leading-7 text-muted-foreground">
            <li>
              <strong className="font-semibold text-foreground">스팸 점수 30% 이하인지 확인</strong> — 31% 이상이면 원인 파악 없이 구매하지 마세요. 60% 이상은 구매를 재고하는 것이 안전합니다.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Wayback Machine에서 과거 콘텐츠 확인</strong> — 과거에 어떤 사이트로 운영되었는지 직접 눈으로 확인합니다. 카지노, 성인, 불법 약품 관련 이력이 있으면 피하세요.
            </li>
            <li>
              <strong className="font-semibold text-foreground">백링크 출처 국가/언어 분포 확인</strong> — 한국어 사이트를 만들 계획인데 백링크가 90% 이상 중국이나 러시아에서 온다면 비정상입니다.
            </li>
            <li>
              <strong className="font-semibold text-foreground">앵커 텍스트 다양성 확인</strong> — 특정 키워드에 70% 이상 집중된 앵커 텍스트 분포는 과거 SEO 조작의 흔적입니다.
            </li>
            <li>
              <strong className="font-semibold text-foreground">도메인 소유자 변경 이력 확인</strong> — Whois 이력에서 소유자가 1~2년마다 바뀌었다면, 스팸 목적으로 전매된 도메인일 수 있습니다.
            </li>
            <li>
              <strong className="font-semibold text-foreground">DA와 스팸 점수의 균형 확인</strong> — DA 40인데 스팸 점수가 50%라면, DA가 인위적으로 부풀려졌을 가능성이 큽니다. DA 대비 스팸 점수가 낮은 도메인을 선택하세요.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Google에서 직접 검색</strong> — <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">site:도메인명</code> 으로 검색해서 인덱싱 상태를 확인합니다. 아예 결과가 0이면 Google에서 이미 페널티를 받았을 수 있습니다.
            </li>
          </ol>

          <p className="mt-4 text-base leading-7 text-muted-foreground">
            중고 도메인 검토 시에는{" "}
            <Link href="/tools/domain-value" className="text-primary hover:underline">
              도메인 가치 평가 도구
            </Link>
            로 전반적인 품질을 확인하고, 위 체크리스트를 하나씩 점검하는 것을 권장합니다. DA만 보고 판단하면 실패할 확률이 높습니다.
          </p>
        </section>

        {/* 8. 자주 하는 실수 3가지 */}
        <section>
          <h2 id="common-mistakes" className="mt-12 mb-4 text-2xl font-bold text-foreground">
            8. 자주 하는 실수 3가지
          </h2>

          <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground">
            실수 1: DA만 보고 도메인 구매
          </h3>
          <p className="text-base leading-7 text-muted-foreground">
            DA가 50이 넘으면 좋은 도메인이라고 생각하기 쉽지만, 스팸 점수를 확인하지 않으면 낭패를 볼 수 있습니다. DA는 백링크가 많으면 올라가는데, 그 백링크가 모두 저품질이어도 수치는 높게 나타납니다. DA와 스팸 점수를 반드시 함께 확인하세요.
          </p>

          <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground">
            실수 2: 디스어보우를 무조건 실행
          </h3>
          <p className="text-base leading-7 text-muted-foreground">
            스팸 점수가 조금 높다고 모든 의심스러운 백링크를 디스어보우하는 것은 위험합니다. 디스어보우를 잘못 적용하면 오히려 유용한 백링크까지 무효화되어 검색 순위가 떨어질 수 있습니다. 반드시 하나하나 확인하고, 명백히 저품질인 링크만 대상으로 하세요.
          </p>

          <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground">
            실수 3: 한 번 확인하고 방치
          </h3>
          <p className="text-base leading-7 text-muted-foreground">
            스팸 점수는 시간이 지나면서 변합니다. 경쟁자가 네거티브 SEO를 시도하거나, 새로운 스팸 봇이 백링크를 걸 수 있습니다. 한 번 확인하고 &quot;괜찮네&quot;라고 방치하면 몇 달 뒤 점수가 급등해 있을 수 있습니다. 최소 월 1회 모니터링을 습관화하세요.
          </p>
        </section>

        {/* 9. 요약 */}
        <section>
          <h2 id="summary" className="mt-12 mb-4 text-2xl font-bold text-foreground">
            9. 요약
          </h2>
          <p className="text-base leading-7 text-muted-foreground">핵심 내용을 정리하면 다음과 같습니다.</p>
          <ul className="mt-3 space-y-2 pl-6 list-disc text-base leading-7 text-muted-foreground">
            <li>
              <strong className="font-semibold text-foreground">스팸 점수</strong>는 도메인이 스팸으로 분류될 위험도를 0~100%로 나타내는 지표이며, 27가지 스팸 플래그를 기반으로 산출됩니다
            </li>
            <li>
              <strong className="font-semibold text-foreground">DA, DR, Trust Flow</strong>와 함께 종합적으로 해석해야 정확한 도메인 평가가 가능합니다
            </li>
            <li>
              <strong className="font-semibold text-foreground">주요 원인 8가지</strong>: 저품질 백링크, 콘텐츠 부재, 앵커 텍스트 조작, 과거 스팸 이력, PBN 연결, 외국어 스팸 링크, 리다이렉트 체인, 히스토리 단절
            </li>
            <li>
              <strong className="font-semibold text-foreground">30% 이하</strong>는 안전, <strong className="font-semibold text-foreground">31~60%</strong>는 주의, <strong className="font-semibold text-foreground">61% 이상</strong>은 즉시 조치 필요
            </li>
            <li>
              <strong className="font-semibold text-foreground">디스어보우</strong>는 명백히 저품질인 링크에만 신중하게 적용해야 합니다
            </li>
            <li>
              <strong className="font-semibold text-foreground">중고 도메인 구매 전</strong> 7가지 체크리스트를 반드시 점검하세요
            </li>
            <li>
              <strong className="font-semibold text-foreground">월 1회 정기 모니터링</strong>으로 점수 변화를 추적하는 것이 최선의 방어입니다
            </li>
          </ul>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            아직 내 도메인의 상태를 확인해 본 적이 없다면, 지금 바로{" "}
            <Link href="/" className="text-primary hover:underline">
              도메인체커
            </Link>
            에서 도메인을 검색해 보세요. DA, DR 등 기본 지표는 무료로 확인할 수 있고, 스팸 점수를 포함한 심화 분석은 Pro에서 제공됩니다.
          </p>
        </section>

        {/* 10. FAQ */}
        <section>
          <h2 id="faq" className="mt-12 mb-4 text-2xl font-bold text-foreground">
            10. FAQ
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground">
                스팸 점수란 정확히 무엇인가요?
              </h3>
              <p className="text-base leading-7 text-muted-foreground">
                스팸 점수는 도메인이 검색엔진에서 스팸으로 분류될 가능성을 0~100% 사이로 수치화한 지표입니다. 백링크 품질, 콘텐츠 상태, 사이트 구조 등 27가지 이상의 스팸 플래그를 종합해 산출하며, 검색엔진 공식 지표가 아닌 외부 분석 도구의 추정 점수입니다. 이 점수가 높다고 반드시 Google에서 페널티를 받는 것은 아니지만, 위험 신호로 받아들여야 합니다.
              </p>
            </div>

            <div>
              <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground">
                스팸 점수가 높으면 검색 순위가 떨어지나요?
              </h3>
              <p className="text-base leading-7 text-muted-foreground">
                스팸 점수 자체가 Google 순위에 직접 반영되지는 않습니다. 다만 스팸 점수가 높다는 것은 저품질 백링크가 많거나 사이트 신뢰도에 문제가 있다는 신호이므로, 간접적으로 검색 순위에 부정적 영향을 줄 수 있습니다. Google의 SpamBrain 알고리즘은 유사한 신호를 자체적으로 감지하기 때문에, 스팸 점수가 높은 도메인은 검색 결과에서 불이익을 받을 가능성이 있습니다.
              </p>
            </div>

            <div>
              <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground">
                스팸 점수를 무료로 확인할 수 있나요?
              </h3>
              <p className="text-base leading-7 text-muted-foreground">
                기본적인 도메인 지표(DA, DR 등)는 무료 도구로 확인할 수 있습니다. 스팸 점수는 보통 유료 또는 Pro 등급에서 제공되는 심화 지표입니다. 도메인체커에서도 기본 분석은 무료이며, 스팸 점수는 Pro 기능으로 제공됩니다. 무료 범위 내에서도 DA, DR, 백링크 수 등을 통해 간접적으로 도메인의 건강 상태를 추정할 수 있습니다.
              </p>
            </div>

            <div>
              <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground">
                디스어보우(Disavow)를 하면 스팸 점수가 바로 내려가나요?
              </h3>
              <p className="text-base leading-7 text-muted-foreground">
                디스어보우를 제출한다고 즉시 점수가 변하지는 않습니다. Google이 해당 링크를 처리하는 데 수 주에서 수 개월이 걸릴 수 있으며, 외부 분석 도구의 점수 반영에도 시간이 필요합니다. 보통 디스어보우 제출 후 4~8주 뒤에 변화가 나타나기 시작합니다. 꾸준한 모니터링이 중요합니다.
              </p>
            </div>

            <div>
              <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground">
                새 도메인도 스팸 점수가 높을 수 있나요?
              </h3>
              <p className="text-base leading-7 text-muted-foreground">
                드물지만 가능합니다. 새 도메인이라도 스팸 사이트에서 일방적으로 백링크를 보내면 점수가 올라갈 수 있습니다. 이를 &quot;네거티브 SEO&quot;라고 부르며, 발견 즉시 디스어보우로 대응하는 것이 좋습니다. 또한 이전에 등록되었다가 만료된 후 재등록된 도메인이라면, 과거의 스팸 이력이 남아 있을 수도 있으므로 Whois 이력을 확인하세요.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* 관련 글 */}
      <div className="blog-related">
        <h3 className="text-lg font-semibold mb-4">관련 글</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/blog/what-is-da" className="blog-related-card">
            <p className="font-medium text-sm">Domain Authority(DA)란?</p>
            <p className="text-xs text-muted-foreground mt-1">DA의 의미, 계산 방식, 등급표까지 핵심 설명합니다.</p>
          </Link>
          <Link href="/blog/how-to-choose-domain" className="blog-related-card">
            <p className="font-medium text-sm">좋은 도메인 고르는 법 — 5가지 기준</p>
            <p className="text-xs text-muted-foreground mt-1">DA/DR, TLD, 도메인 나이 등 투자 가치 있는 도메인을 고르는 핵심 기준.</p>
          </Link>
          <Link href="/blog/domain-auction-guide" className="blog-related-card">
            <p className="font-medium text-sm">도메인 경매 완벽 가이드</p>
            <p className="text-xs text-muted-foreground mt-1">경매 플랫폼 비교부터 입찰 전략, 낙찰 후 절차까지 알아보세요.</p>
          </Link>
        </div>
      </div>

      {/* CTA */}
      <div className="blog-cta">
        <p className="text-lg font-semibold">도메인의 건강 상태를 확인해 보세요</p>
        <p className="mt-1 text-sm text-muted-foreground">
          도메인체커에서 DA, DR 등 기본 SEO 지표는 무료로 확인할 수 있으며,
          스팸 점수를 포함한 정밀 분석은 Pro에서 이용할 수 있습니다.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          도메인 분석하기
        </Link>
      </div>
    </article>
  );
}
