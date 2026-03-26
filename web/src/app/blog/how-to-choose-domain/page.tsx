import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "좋은 도메인 고르는 법 — 투자 가치 있는 도메인 5가지 기준 — 도메인체커",
  description:
    "DA/DR, TLD, 도메인 나이, 백링크 프로필, 브랜드 가능성까지. 수익성 높은 도메인을 고르는 5가지 핵심 기준을 실전 예시와 함께 정리합니다.",
  keywords: [
    "도메인 고르는 법",
    "도메인 투자 기준",
    "좋은 도메인 특징",
    "도메인 가치 평가",
    "도메인 DA DR",
    "도메인 TLD",
    "도메인 백링크",
    "도메인 브랜드 가능성",
    "도메인 구매 체크리스트",
    "TLD별 가치 비교",
  ],
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "좋은 도메인 고르는 법 — 투자 가치 있는 도메인 5가지 기준",
    description:
      "DA/DR, TLD, 도메인 나이, 백링크 프로필, 브랜드 가능성까지. 수익성 높은 도메인을 고르는 5가지 핵심 기준.",
    author: { "@type": "Organization", name: "도메인체커" },
    publisher: {
      "@type": "Organization",
      name: "도메인체커",
      logo: {
        "@type": "ImageObject",
        url: "https://domainchecker.co.kr/icon.svg",
      },
    },
    mainEntityOfPage: "https://domainchecker.co.kr/blog/how-to-choose-domain",
    datePublished: "2026-03-15",
    dateModified: "2026-03-15",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "도메인 투자 초보자는 어떤 도메인부터 시작해야 하나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "초보자는 .com TLD의 짧은 키워드 도메인부터 시작하는 것을 추천합니다. DA 15~30 범위의 만료 도메인 중 스팸 점수가 낮은 도메인을 $50~$200 사이에서 구매하여 경험을 쌓은 후 점차 규모를 키워가는 것이 안전합니다.",
        },
      },
      {
        "@type": "Question",
        name: "도메인 가치는 어떻게 평가하나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "도메인 가치는 DA/DR 같은 SEO 지표, TLD 종류, 도메인 길이, 키워드 포함 여부, 백링크 품질, 브랜드 가능성을 종합적으로 평가합니다. 도메인체커에서 이러한 지표를 무료로 확인할 수 있습니다.",
        },
      },
      {
        "@type": "Question",
        name: ".com 도메인이 정말 다른 TLD보다 가치가 높은가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "네, 일반적으로 .com은 다른 TLD 대비 2~10배 높은 가격에 거래됩니다. 가장 오래된 TLD로 사용자 신뢰도가 가장 높고, 전 세계적으로 통용되기 때문입니다. 다만 .io, .ai 등 특정 산업에서 프리미엄 대우를 받는 TLD도 있습니다.",
        },
      },
      {
        "@type": "Question",
        name: "만료 도메인과 경매 도메인의 차이는 무엇인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "만료 도메인은 소유자가 갱신하지 않아 등록 기간이 끝난 도메인이고, 경매 도메인은 소유자가 자발적으로 매각을 위해 올린 도메인입니다. 만료 도메인은 비교적 저렴하지만 스팸 이력 확인이 필수이고, 경매 도메인은 가격이 높지만 상태가 양호한 경우가 많습니다.",
        },
      },
      {
        "@type": "Question",
        name: "도메인 나이가 정말 SEO에 영향을 주나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "도메인 나이 자체가 직접적인 랭킹 팩터는 아니지만, 오래된 도메인은 대개 더 많은 백링크와 검색엔진 신뢰도를 축적하고 있습니다. 5년 이상 된 도메인은 새 도메인보다 검색 순위 진입이 빠른 경향이 있습니다.",
        },
      },
    ],
  },
];

export default function HowToChooseDomainPage() {
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
        좋은 도메인 고르는 법 — 투자 가치 있는 도메인 5가지 기준
      </h1>

      <div className="blog-meta">
        <time dateTime="2026-03-15">2026년 3월 15일</time>
        <span aria-hidden="true">·</span>
        <span>5분 읽기</span>
      </div>

      <nav className="blog-toc">
        <p className="blog-toc-title">목차</p>
        <ol className="space-y-1.5">
          <li><a href="#intro">도메인 선택이 투자 수익을 결정한다</a></li>
          <li><a href="#da-dr">1. DA/DR 점수가 높은 도메인</a></li>
          <li><a href="#tld">2. 프리미엄 TLD</a></li>
          <li><a href="#domain-age">3. 도메인 나이</a></li>
          <li><a href="#backlink">4. 건전한 백링크 프로필</a></li>
          <li><a href="#brandability">5. 브랜드 가능성</a></li>
          <li><a href="#tld-comparison">TLD별 가치 비교표</a></li>
          <li><a href="#checklist">도메인 구매 전 체크리스트 10가지</a></li>
          <li><a href="#avoid">피해야 할 도메인 유형</a></li>
          <li><a href="#faq">자주 묻는 질문</a></li>
        </ol>
      </nav>

      <div className="blog-prose mt-10">
        <section>
          <h2 id="intro">도메인 선택이 투자 수익을 결정한다</h2>
          <p>
            도메인 투자에서 수익을 내려면 &quot;어떤 도메인을 살 것인가&quot;가 가장 중요합니다.
            수천 개의 만료 도메인과 경매 도메인 중에서 가치 있는 도메인을 골라내는 5가지 핵심
            기준을 실전 예시와 함께 정리했습니다. 이 기준들을 종합적으로 적용하면 투자 실패
            확률을 크게 낮출 수 있습니다.
          </p>
        </section>

        <section>
          <h2 id="da-dr">1. DA/DR 점수가 높은 도메인</h2>
          <p>
            Moz의 Domain Authority(DA)와 Ahrefs의 Domain Rating(DR)은 도메인의 SEO 파워를
            정량화한 지표입니다. 구체적인 기준은 다음과 같습니다.
          </p>
          <ul>
            <li><strong>DA 20 이상, DR 15 이상</strong> — 기본적인 백링크 자산이 있는 도메인. 투자 검토 가치 있음.</li>
            <li><strong>DA 40 이상, DR 30 이상</strong> — 상당한 SEO 파워를 가진 프리미엄 도메인. 재판매 시 높은 가격 기대.</li>
            <li><strong>DA 60 이상</strong> — 최상위 도메인. 수천 달러 이상의 거래 가격이 형성됩니다.</li>
          </ul>
          <p>
            단, 스팸 점수가 높은 도메인은 인위적인 백링크가 쌓인 경우가 많으므로
            반드시 함께 확인해야 합니다. DA 50이지만 스팸 점수가 60%인 도메인보다,
            DA 25이지만 스팸 점수가 2%인 도메인이 실제 가치가 더 높을 수 있습니다.{" "}
            <Link href="/blog/what-is-da">DA에 대한 자세한 설명</Link>은 별도 글에서
            확인하세요.
          </p>
        </section>

        <section>
          <h2 id="tld">2. 프리미엄 TLD(.com, .net, .org)</h2>
          <p>
            TLD(Top-Level Domain)는 도메인의 기본 가치에 큰 영향을 미칩니다.
            같은 키워드라도 TLD에 따라 가격 차이가 극명합니다.
          </p>
          <ul>
            <li><strong>.com</strong> — 가장 높은 가치. 동일 키워드 기준 .xyz 대비 <strong>2~5배</strong>, .info 대비 <strong>5~10배</strong> 가격.</li>
            <li><strong>.net / .org</strong> — .com 다음으로 안정적인 수요. .com 대비 약 30~50% 가격.</li>
            <li><strong>.io</strong> — 기술 스타트업 시장에서 프리미엄. 짧은 키워드는 .com에 준하는 가격.</li>
            <li><strong>.ai</strong> — AI 산업 성장과 함께 급등 중. 2024년 이후 거래가 급증.</li>
          </ul>
          <p>
            예를 들어, &quot;payflow&quot;라는 키워드의 경우 payflow.com은 $5,000~$15,000,
            payflow.io는 $1,000~$3,000, payflow.xyz는 $100~$300 수준에서 거래됩니다.
            TLD 선택만으로도 투자 수익률이 크게 달라집니다.
          </p>
        </section>

        <section>
          <h2 id="domain-age">3. 도메인 나이(Domain Age)</h2>
          <p>
            오래된 도메인은 검색엔진의 신뢰도 측면에서 유리합니다.
          </p>
          <ul>
            <li><strong>5년 이상</strong> — 검색 순위 진입이 새 도메인 대비 평균 40% 빠름.</li>
            <li><strong>10년 이상</strong> — 장기간 유지된 도메인으로 높은 신뢰도. 투자자에게 프리미엄.</li>
            <li><strong>20년 이상</strong> — 인터넷 초기부터 존재한 희소 도메인. 컬렉터 가치 추가.</li>
          </ul>
          <p>
            Wayback Machine에 과거 웹사이트 이력이 남아 있다면 해당 도메인의 역사적 가치도
            확인할 수 있습니다. 과거에 정상적인 사이트가 운영되었던 이력이 있으면 긍정적
            신호이며, 스팸 사이트나 피싱 사이트 이력이 있으면 주의가 필요합니다.{" "}
            <Link href="/">도메인체커</Link>에서 Whois 등록일과 Wayback 히스토리를
            한 번에 확인할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 id="backlink">4. 건전한 백링크 프로필</h2>
          <p>
            백링크의 수도 중요하지만, 더 중요한 것은 <strong>품질과 다양성</strong>입니다.
            핵심 체크 포인트는 다음과 같습니다.
          </p>
          <ul>
            <li><strong>Trust Flow(TF) 15 이상</strong> — 기본적인 링크 신뢰도 확보.</li>
            <li><strong>TF/CF 비율 0.5 이상</strong> — TF(Trust Flow)와 CF(Citation Flow)의 비율이 0.5 이상이면 건전한 링크 프로필.</li>
            <li><strong>참조 도메인 50개 이상</strong> — 다양한 출처에서 링크를 받는 도메인이 가치가 높음.</li>
            <li><strong>스팸 점수 30% 미만</strong> — 인위적 링크 조작 가능성이 낮은 안전한 도메인.</li>
          </ul>
          <p>
            소수의 사이트에서 대량의 백링크를 받는 것보다, 100개 이상의 서로 다른
            도메인에서 각각 자연스러운 링크를 받는 것이 훨씬 가치 있습니다.
          </p>
        </section>

        <section>
          <h2 id="brandability">5. 브랜드 가능성(Brandability)</h2>
          <p>
            짧고 발음하기 쉬우며 기억에 남는 도메인은 브랜드로 활용할 수 있는 가능성이
            높습니다. 브랜드 도메인의 조건은 다음과 같습니다.
          </p>
          <ul>
            <li><strong>2단어 이내, 12자 이하</strong> — 짧을수록 기억하기 쉽고 타이핑 실수가 적습니다.</li>
            <li><strong>발음이 직관적</strong> — 전화로 말해도 바로 이해할 수 있는 도메인이 좋습니다.</li>
            <li><strong>산업 키워드 포함</strong> — healthtrack.com, payflow.io처럼 분야가 드러나면 해당 업계 스타트업에 높은 가격에 매각 가능.</li>
            <li><strong>숫자/하이픈 미포함</strong> — 숫자나 하이픈이 들어가면 브랜드 가치가 50% 이상 하락합니다.</li>
          </ul>
          <p>
            특히 AI, 핀테크, 헬스케어 등 성장 산업의 키워드를 포함한 .com 도메인은
            스타트업에 $5,000~$50,000 이상에 매각된 사례가 많습니다.
          </p>
        </section>

        <section>
          <h2 id="tld-comparison">TLD별 가치 비교표</h2>
          <p>
            주요 TLD의 특징과 투자 가치를 한눈에 비교해 보세요.
          </p>
          <table>
            <thead>
              <tr>
                <th>TLD</th>
                <th>특징</th>
                <th>평균 거래 가격대</th>
                <th>적합 용도</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>.com</td>
                <td>가장 높은 신뢰도와 인지도</td>
                <td>$500 ~ $50,000+</td>
                <td>모든 산업, 글로벌 브랜드</td>
              </tr>
              <tr>
                <td>.net</td>
                <td>기술/네트워크 이미지</td>
                <td>$100 ~ $5,000</td>
                <td>IT 서비스, 네트워크</td>
              </tr>
              <tr>
                <td>.org</td>
                <td>비영리/교육 신뢰 이미지</td>
                <td>$100 ~ $5,000</td>
                <td>비영리, 커뮤니티, 교육</td>
              </tr>
              <tr>
                <td>.io</td>
                <td>스타트업/기술 프리미엄</td>
                <td>$200 ~ $10,000</td>
                <td>SaaS, 개발자 도구</td>
              </tr>
              <tr>
                <td>.ai</td>
                <td>AI 산업 급등 TLD</td>
                <td>$500 ~ $20,000+</td>
                <td>AI/ML 스타트업</td>
              </tr>
              <tr>
                <td>.kr</td>
                <td>한국 시장 특화</td>
                <td>$50 ~ $2,000</td>
                <td>한국 비즈니스, 로컬 브랜드</td>
              </tr>
              <tr>
                <td>.xyz</td>
                <td>저렴한 가격, 신규 프로젝트용</td>
                <td>$10 ~ $500</td>
                <td>실험적 프로젝트, 개인 포트폴리오</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2 id="checklist">도메인 구매 전 체크리스트 10가지</h2>
          <p>
            도메인을 구매하기 전에 아래 10가지 항목을 반드시 확인하세요.
            하나라도 문제가 있으면 구매를 재고하는 것이 안전합니다.
          </p>
          <ol>
            <li><strong>DA/DR 점수 확인</strong> — 최소 DA 15 이상인지 확인합니다.</li>
            <li><strong>스팸 점수 확인</strong> — 30% 미만이어야 안전합니다. <Link href="/blog/domain-spam-score-check">스팸 점수 가이드</Link> 참고.</li>
            <li><strong>Whois 등록 이력 확인</strong> — 도메인 나이와 소유자 변경 이력을 확인합니다.</li>
            <li><strong>Wayback Machine 이력 확인</strong> — 과거에 스팸/피싱 사이트로 사용된 적이 없는지 확인합니다.</li>
            <li><strong>백링크 품질 검토</strong> — TF/CF 비율, 참조 도메인 다양성을 확인합니다.</li>
            <li><strong>Google 세이프브라우징 확인</strong> — 악성 사이트로 등록되어 있지 않은지 확인합니다.</li>
            <li><strong>상표권 침해 여부</strong> — 유명 브랜드와 유사한 도메인은 법적 분쟁 위험이 있습니다.</li>
            <li><strong>TLD 가치 평가</strong> — .com이 가장 유리하며, 목적에 맞는 TLD인지 확인합니다.</li>
            <li><strong>경매 시세 비교</strong> — <Link href="/market-history">낙찰 이력</Link>에서 유사 도메인의 거래 가격을 확인합니다.</li>
            <li><strong>활용 계획 수립</strong> — 재판매, 사이트 구축, 리디렉트 등 구매 후 활용 전략을 미리 정합니다.</li>
          </ol>
          <p>
            <Link href="/">도메인체커</Link>에서 위 항목 중 DA, DR, TF, 백링크, Whois,
            Wayback 히스토리를 한 번에 분석할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 id="avoid">피해야 할 도메인 유형</h2>
          <p>
            아무리 DA가 높아도 아래 유형에 해당하는 도메인은 피하는 것이 현명합니다.
          </p>
          <h3>상표권 침해 위험 도메인</h3>
          <p>
            유명 브랜드명을 포함하거나 유사한 도메인(예: g00gle-shop.com)은 UDRP(Uniform
            Domain-Name Dispute-Resolution Policy) 분쟁 대상이 될 수 있습니다. 패소 시
            도메인을 무상으로 반환해야 하므로 투자금을 전액 잃게 됩니다.
          </p>
          <h3>스팸 이력이 있는 도메인</h3>
          <p>
            Wayback Machine에서 약물 판매, 도박, 피싱 사이트 이력이 확인되는 도메인은
            검색엔진에 이미 패널티가 부과되었을 가능성이 높습니다. 스팸 점수가 50% 이상인
            도메인도 동일한 이유로 피해야 합니다.
          </p>
          <h3>하이픈이 과다한 도메인</h3>
          <p>
            best-cheap-domain-hosting.com처럼 하이픈이 2개 이상 포함된 도메인은 스팸
            사이트의 전형적인 패턴입니다. 검색엔진도 이런 도메인을 낮게 평가하며,
            브랜드 가치도 거의 없습니다.
          </p>
          <h3>숫자가 포함된 도메인</h3>
          <p>
            domain123.com, 4sale-domains.net처럼 의미 없는 숫자가 포함된 도메인은
            기억하기 어렵고 브랜드 가치가 낮습니다. 다만 연도(2024.com)나 의미 있는
            숫자(360.com)는 예외적으로 높은 가치를 가질 수 있습니다.
          </p>
        </section>

        <section>
          <h2 id="faq">자주 묻는 질문</h2>

          <h3>도메인 투자 초보자는 어떤 도메인부터 시작해야 하나요?</h3>
          <p>
            초보자는 .com TLD의 짧은 키워드 도메인부터 시작하는 것을 추천합니다.
            DA 15~30 범위의 만료 도메인 중 스팸 점수가 낮은 도메인을 $50~$200 사이에서
            구매하여 경험을 쌓은 후 점차 규모를 키워가는 것이 안전합니다.
          </p>

          <h3>도메인 가치는 어떻게 평가하나요?</h3>
          <p>
            도메인 가치는 DA/DR 같은 SEO 지표, TLD 종류, 도메인 길이, 키워드 포함 여부,
            백링크 품질, 브랜드 가능성을 종합적으로 평가합니다.{" "}
            <Link href="/tools/domain-value">도메인 가치 평가 도구</Link>를 활용하면
            예상 가치를 빠르게 확인할 수 있습니다.
          </p>

          <h3>.com 도메인이 정말 다른 TLD보다 가치가 높은가요?</h3>
          <p>
            네, 일반적으로 .com은 다른 TLD 대비 2~10배 높은 가격에 거래됩니다.
            가장 오래된 TLD로 사용자 신뢰도가 가장 높고, 전 세계적으로 통용되기 때문입니다.
            다만 .io, .ai 등 특정 산업에서 프리미엄 대우를 받는 TLD도 있습니다.
          </p>

          <h3>만료 도메인과 경매 도메인의 차이는 무엇인가요?</h3>
          <p>
            만료 도메인은 소유자가 갱신하지 않아 등록 기간이 끝난 도메인이고, 경매
            도메인은 소유자가 자발적으로 매각을 위해 올린 도메인입니다. 만료 도메인은
            비교적 저렴하지만 스팸 이력 확인이 필수이고, 경매 도메인은 가격이 높지만
            상태가 양호한 경우가 많습니다.{" "}
            <Link href="/blog/domain-auction-guide">경매 가이드</Link>에서 더 자세히
            알아보세요.
          </p>

          <h3>도메인 나이가 정말 SEO에 영향을 주나요?</h3>
          <p>
            도메인 나이 자체가 직접적인 랭킹 팩터는 아니지만, 오래된 도메인은 대개
            더 많은 백링크와 검색엔진 신뢰도를 축적하고 있습니다. 5년 이상 된 도메인은
            새 도메인보다 검색 순위 진입이 빠른 경향이 있습니다.
          </p>
        </section>

        <div className="blog-related">
          <h3 className="text-lg font-semibold mb-4">관련 글</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/blog/what-is-da" className="blog-related-card">
              <p className="font-medium text-sm">Domain Authority(DA)란?</p>
              <p className="text-xs text-muted-foreground mt-1">DA의 의미, 계산 방식, 등급표까지 핵심 지표를 상세히 설명합니다.</p>
            </Link>
            <Link href="/blog/domain-auction-guide" className="blog-related-card">
              <p className="font-medium text-sm">도메인 경매 완벽 가이드</p>
              <p className="text-xs text-muted-foreground mt-1">경매 플랫폼 비교부터 입찰 전략, 낙찰 후 절차까지 알아보세요.</p>
            </Link>
            <Link href="/blog/domain-spam-score-check" className="blog-related-card">
              <p className="font-medium text-sm">도메인 스팸 점수 확인 방법</p>
              <p className="text-xs text-muted-foreground mt-1">스팸 점수가 높아지는 원인과 낮추는 실전 가이드.</p>
            </Link>
          </div>
        </div>

        <div className="blog-cta">
          <p className="text-lg font-semibold">관심 도메인의 지표를 확인해 보세요</p>
          <p className="mt-1 text-sm text-muted-foreground">
            도메인체커에서 DA, DR, TF, 백링크 수, Whois 정보를 무료로 분석할 수 있습니다.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            도메인 분석하기
          </Link>
        </div>
      </div>
    </article>
  );
}
