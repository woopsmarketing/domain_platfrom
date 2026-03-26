import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Domain Authority(DA)란? 도메인 품질을 판단하는 핵심 지표 — 도메인체커",
  description:
    "Moz가 개발한 Domain Authority(DA)의 의미와 계산 방식, 도메인 투자에서 DA가 중요한 이유를 상세히 설명합니다. DA 점수로 도메인 가치를 판단하는 방법을 알아보세요.",
  keywords: [
    "Domain Authority",
    "DA란",
    "Moz DA",
    "도메인 권위 점수",
    "도메인 품질 지표",
    "SEO 도메인 분석",
    "도메인 가치 평가",
    "DA DR TF 비교",
    "DA 점수 등급",
    "DA 높이는 방법",
  ],
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Domain Authority(DA)란? 도메인 품질을 판단하는 핵심 지표",
    description:
      "Moz가 개발한 Domain Authority(DA)의 의미와 계산 방식, 도메인 투자에서 DA가 중요한 이유를 상세히 설명합니다.",
    author: { "@type": "Organization", name: "도메인체커" },
    publisher: {
      "@type": "Organization",
      name: "도메인체커",
      logo: {
        "@type": "ImageObject",
        url: "https://domainchecker.co.kr/icon.svg",
      },
    },
    mainEntityOfPage: "https://domainchecker.co.kr/blog/what-is-da",
    datePublished: "2026-03-10",
    dateModified: "2026-03-10",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "DA 점수가 높으면 무조건 좋은 도메인인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "DA 점수가 높다고 무조건 좋은 도메인은 아닙니다. 스팸 백링크로 인위적으로 DA를 올린 경우도 있으므로, 반드시 스팸 점수와 백링크 품질을 함께 확인해야 합니다. DA는 여러 품질 지표 중 하나로 참고하는 것이 올바른 활용법입니다.",
        },
      },
      {
        "@type": "Question",
        name: "DA는 얼마나 자주 업데이트되나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "DA 점수는 보통 월 1~2회 업데이트됩니다. 웹 크롤러가 새로운 백링크 데이터를 수집하고 인덱싱한 후 점수에 반영하기 때문에, 실시간 변동이 아닌 주기적인 업데이트 방식입니다.",
        },
      },
      {
        "@type": "Question",
        name: "새 도메인의 DA는 몇 점인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "새로 등록한 도메인의 DA는 1점에서 시작합니다. 백링크가 전혀 없는 상태이므로 최저 점수가 부여되며, 양질의 콘텐츠를 게시하고 자연스러운 백링크를 확보하면서 점차 올라갑니다.",
        },
      },
      {
        "@type": "Question",
        name: "DA를 빨리 올리는 방법이 있나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "DA를 단기간에 급격히 올리는 정당한 방법은 없습니다. 유료 링크 구매나 PBN(Private Blog Network)은 오히려 스팸 점수를 높이고 검색엔진 패널티를 받을 수 있습니다. 양질의 콘텐츠 제작, 자연스러운 백링크 확보, 기술적 SEO 최적화를 꾸준히 하는 것이 유일한 방법입니다.",
        },
      },
      {
        "@type": "Question",
        name: "DA와 PA의 차이는 무엇인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "DA(Domain Authority)는 도메인 전체의 권위도를, PA(Page Authority)는 개별 페이지의 권위도를 측정합니다. DA가 높은 도메인에서도 특정 페이지의 PA는 낮을 수 있으며, 그 반대도 가능합니다. 도메인 투자에서는 주로 DA를 기준으로 평가합니다.",
        },
      },
    ],
  },
];

export default function WhatIsDaPage() {
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
        Domain Authority(DA)란? 도메인 품질을 판단하는 핵심 지표
      </h1>

      <div className="blog-meta">
        <time dateTime="2026-03-10">2026년 3월 10일</time>
        <span aria-hidden="true">·</span>
        <span>4분 읽기</span>
      </div>

      <nav className="blog-toc">
        <p className="blog-toc-title">목차</p>
        <ol className="space-y-1.5">
          <li><a href="#what-is-da">DA란 무엇인가?</a></li>
          <li><a href="#how-da-calculated">DA는 어떻게 계산되나?</a></li>
          <li><a href="#why-da-matters">도메인 투자에서 DA가 중요한 이유</a></li>
          <li><a href="#da-score-table">DA 점수 등급표</a></li>
          <li><a href="#how-to-improve-da">DA를 높이는 방법</a></li>
          <li><a href="#da-vs-dr-tf">DA vs DR vs TF 비교</a></li>
          <li><a href="#da-cautions">DA 확인 시 주의사항</a></li>
          <li><a href="#faq">자주 묻는 질문</a></li>
        </ol>
      </nav>

      <div className="blog-prose mt-10">
        <section>
          <h2 id="what-is-da">DA란 무엇인가?</h2>
          <p>
            Domain Authority(DA)는 미국의 SEO 소프트웨어 기업 Moz가 개발한 검색엔진 순위 예측
            점수입니다. 1점부터 100점까지의 범위로 표시되며, 점수가 높을수록 해당 도메인이
            검색엔진 결과 페이지(SERP)에서 높은 순위를 차지할 가능성이 큽니다.
          </p>
          <p>
            DA는 단일 페이지가 아닌 <strong>도메인 전체의 권위도</strong>를 측정하는 지표로,
            도메인 투자자와 SEO 전문가에게 가장 널리 사용되는 품질 기준 중 하나입니다.
            쉽게 말해, DA는 해당 도메인이 검색엔진에서 얼마나 &quot;신뢰받는가&quot;를
            숫자로 표현한 것입니다.
          </p>
          <p>
            예를 들어 wikipedia.org의 DA는 90점 이상으로, 거의 모든 검색 키워드에서
            상위 노출됩니다. 반면 새로 만든 블로그의 DA는 1~5점 수준이며, 검색 순위
            진입에 상당한 시간이 걸립니다. 이처럼 DA는 도메인 간 &quot;출발선의 차이&quot;를
            정량적으로 보여줍니다.
          </p>
        </section>

        <section>
          <h2 id="how-da-calculated">DA는 어떻게 계산되나?</h2>
          <p>
            Moz는 자체 웹 크롤러를 통해 수십억 개의 웹페이지를 분석하고, 링크 프로필 데이터를
            기반으로 DA 점수를 산출합니다. 주요 평가 요소는 다음과 같습니다.
          </p>
          <ul>
            <li><strong>백링크의 수와 품질</strong> — 루트 도메인으로 향하는 외부 링크가 많고 품질이 높을수록 DA가 올라갑니다.</li>
            <li><strong>링크 도메인의 다양성</strong> — 소수의 사이트에서 대량의 링크를 받는 것보다, 다양한 도메인에서 링크를 받는 것이 유리합니다.</li>
            <li><strong>내부 신뢰도 지표</strong> — MozRank, MozTrust 등 Moz 자체 신뢰도 지표가 복합적으로 반영됩니다.</li>
            <li><strong>머신러닝 모델</strong> — 실제 Google 검색 결과와의 상관관계를 학습한 예측 모델이 최종 점수를 산출합니다.</li>
          </ul>
          <p>
            중요한 점은 DA가 Google의 공식 랭킹 팩터가 아니라 Moz가 독자적으로
            만든 예측 지표라는 것입니다. 그러나 실제 검색 순위와의 상관관계가 높아
            업계 표준처럼 활용되고 있습니다. DA는 절대 점수가 아닌
            <strong>상대 비교 지표</strong>로 이해하는 것이 정확합니다.
          </p>
        </section>

        <section>
          <h2 id="why-da-matters">도메인 투자에서 DA가 중요한 이유</h2>
          <p>
            도메인 투자자에게 DA는 도메인의 잠재 가치를 빠르게 판단하는 핵심 필터 역할을
            합니다. DA가 높은 만료 도메인이나 경매 도메인은 이미 상당한 백링크 자산을
            보유하고 있으며, 이를 활용할 수 있는 방법은 크게 세 가지입니다.
          </p>
          <ol>
            <li><strong>새 사이트 구축</strong> — DA가 높은 도메인 위에 새 사이트를 만들면 검색 노출이 빨라집니다.</li>
            <li><strong>301 리디렉트</strong> — 기존 사이트로 DA 파워를 전달하여 SEO를 강화합니다.</li>
            <li><strong>재판매</strong> — DA가 높은 도메인은 그 자체로 프리미엄 가격에 거래됩니다.</li>
          </ol>
          <p>
            다만 DA만으로 도메인의 모든 가치를 판단하기는 어렵습니다. Domain Rating(DR),
            Trust Flow(TF) 등 다른 지표와 함께 종합적으로 분석해야 정확한 가치 평가가
            가능합니다.{" "}
            <Link href="/">도메인체커</Link>에서 DA, DR, TF를 포함한 주요 지표를 한 번에
            확인할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 id="da-score-table">DA 점수 등급표</h2>
          <p>
            DA 점수를 처음 접하면 숫자의 의미를 직관적으로 파악하기 어렵습니다. 아래 등급표를
            참고하면 도메인의 수준을 빠르게 판단할 수 있습니다.
          </p>
          <table>
            <thead>
              <tr>
                <th>DA 점수</th>
                <th>등급</th>
                <th>설명</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>0 ~ 10</td>
                <td>낮음</td>
                <td>신규 도메인이거나 백링크가 거의 없는 상태. 투자 가치 낮음.</td>
              </tr>
              <tr>
                <td>11 ~ 30</td>
                <td>보통</td>
                <td>기본적인 백링크 자산 보유. 성장 가능성 평가 필요.</td>
              </tr>
              <tr>
                <td>31 ~ 50</td>
                <td>양호</td>
                <td>안정적인 SEO 기반. 중소규모 사이트에 적합한 도메인.</td>
              </tr>
              <tr>
                <td>51 ~ 70</td>
                <td>우수</td>
                <td>강력한 백링크 프로필. 경쟁 키워드에서 상위 노출 가능.</td>
              </tr>
              <tr>
                <td>71 ~ 100</td>
                <td>최우수</td>
                <td>업계 최상위 수준. 대기업이나 유명 사이트급의 권위도.</td>
              </tr>
            </tbody>
          </table>
          <p>
            DA 점수는 <strong>로그 스케일</strong>로 작동합니다. 즉, DA를 10에서 20으로 올리는 것보다
            50에서 60으로 올리는 것이 훨씬 어렵습니다. 점수가 높을수록 1점의 가치가
            기하급수적으로 커진다는 의미입니다.
          </p>
        </section>

        <section>
          <h2 id="how-to-improve-da">DA를 높이는 방법</h2>
          <p>
            DA를 올리는 데는 지름길이 없습니다. 아래 4단계를 꾸준히 실천하는 것이
            가장 효과적인 방법입니다.
          </p>
          <h3>1단계: 양질의 백링크 확보</h3>
          <p>
            다른 사이트에서 자연스럽게 링크를 받는 것이 DA 향상의 핵심입니다.
            게스트 포스팅, 인포그래픽 공유, 원본 데이터 기반 콘텐츠 작성 등을 통해
            권위 있는 사이트로부터 백링크를 확보하세요. 한 도메인에서 100개의 링크를
            받는 것보다 100개 도메인에서 각 1개씩 받는 것이 DA에 더 큰 영향을 줍니다.
          </p>
          <h3>2단계: 콘텐츠 품질 향상</h3>
          <p>
            검색 의도에 정확히 맞는 심층 콘텐츠를 제작하세요. 2,000자 이상의 상세한 가이드,
            데이터 기반 분석, 전문가 인사이트가 포함된 콘텐츠는 자연스럽게 백링크를
            유도합니다. 얇은 콘텐츠(thin content)는 오히려 DA에 부정적 영향을 줄 수 있습니다.
          </p>
          <h3>3단계: 내부 링크 구조 최적화</h3>
          <p>
            사이트 내 페이지 간 체계적인 내부 링크를 구축하세요. 주요 페이지로 링크 주스(link juice)가
            효율적으로 전달되도록 사일로 구조를 설계하면, 동일한 백링크 수로도 더 높은
            DA 효과를 얻을 수 있습니다.
          </p>
          <h3>4단계: 유해 링크 제거</h3>
          <p>
            스팸 사이트나 저품질 디렉토리에서 오는 백링크는 DA를 끌어내립니다. 정기적으로
            백링크 프로필을 점검하고, 유해한 링크는 디스어보우(disavow) 처리하세요.{" "}
            <Link href="/blog/domain-spam-score-check">스팸 점수 확인 방법</Link>을
            참고하면 도움이 됩니다.
          </p>
        </section>

        <section>
          <h2 id="da-vs-dr-tf">DA vs DR vs TF 비교</h2>
          <p>
            도메인 품질을 측정하는 대표 지표 3가지를 비교해 보겠습니다. 각 지표는
            서로 다른 기준으로 도메인을 평가하므로, 하나만 보는 것보다 종합적으로
            분석하는 것이 정확합니다.
          </p>
          <table>
            <thead>
              <tr>
                <th>항목</th>
                <th>DA (Domain Authority)</th>
                <th>DR (Domain Rating)</th>
                <th>TF (Trust Flow)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>제공자</td>
                <td>Moz</td>
                <td>Ahrefs</td>
                <td>Majestic</td>
              </tr>
              <tr>
                <td>점수 범위</td>
                <td>0 ~ 100</td>
                <td>0 ~ 100</td>
                <td>0 ~ 100</td>
              </tr>
              <tr>
                <td>주요 평가 기준</td>
                <td>링크 프로필 + 머신러닝</td>
                <td>백링크 도메인 수 + 품질</td>
                <td>신뢰할 수 있는 링크 품질</td>
              </tr>
              <tr>
                <td>중점</td>
                <td>종합적 권위도</td>
                <td>백링크 파워</td>
                <td>링크 신뢰도</td>
              </tr>
              <tr>
                <td>활용 시나리오</td>
                <td>전반적인 도메인 가치 평가</td>
                <td>백링크 자산 규모 평가</td>
                <td>링크 품질 및 스팸 위험 판단</td>
              </tr>
            </tbody>
          </table>
          <p>
            <Link href="/">도메인체커</Link>에서는 DA, DR, TF 세 가지 지표를 한 화면에서
            동시에 확인할 수 있어, 도메인의 품질을 다각도로 분석할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 id="da-cautions">DA 확인 시 주의사항</h2>
          <p>
            DA는 유용한 지표이지만, 맹신하면 잘못된 투자 결정을 내릴 수 있습니다.
            아래 세 가지를 반드시 기억하세요.
          </p>
          <h3>DA만으로 판단하지 마세요</h3>
          <p>
            DA가 높더라도 스팸 백링크로 부풀려진 경우가 있습니다. 반드시 스팸 점수,
            Trust Flow, 실제 백링크 출처를 함께 확인해야 합니다. DA 50이지만 스팸 점수가
            80%인 도메인보다, DA 25이지만 스팸 점수가 1%인 도메인이 더 가치 있을 수 있습니다.
          </p>
          <h3>스팸 점수를 반드시 함께 확인하세요</h3>
          <p>
            중고 도메인이나 경매 도메인을 구매할 때는 DA와 함께{" "}
            <Link href="/blog/domain-spam-score-check">스팸 점수</Link>를 반드시
            확인하세요. 스팸 점수가 30% 이상이면 인위적 링크 조작의 가능성이 있으며,
            구매 후 검색엔진 패널티 위험이 있습니다.
          </p>
          <h3>추세를 확인하세요</h3>
          <p>
            현재 DA 점수보다 중요한 것은 <strong>DA의 변화 추세</strong>입니다. DA가 꾸준히
            상승하는 도메인은 건전하게 성장하고 있다는 신호이며, 급격히 하락하는 도메인은
            백링크 유실이나 패널티를 의심해야 합니다. Wayback Machine 히스토리와 함께 확인하면
            도메인의 과거 활동을 더 정확히 파악할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 id="faq">자주 묻는 질문</h2>

          <h3>DA 점수가 높으면 무조건 좋은 도메인인가요?</h3>
          <p>
            아닙니다. DA 점수가 높다고 무조건 좋은 도메인은 아닙니다. 스팸 백링크로
            인위적으로 DA를 올린 경우도 있으므로, 반드시 스팸 점수와 백링크 품질을
            함께 확인해야 합니다. DA는 여러 품질 지표 중 하나로 참고하는 것이
            올바른 활용법입니다.
          </p>

          <h3>DA는 얼마나 자주 업데이트되나요?</h3>
          <p>
            DA 점수는 보통 월 1~2회 업데이트됩니다. 웹 크롤러가 새로운 백링크 데이터를
            수집하고 인덱싱한 후 점수에 반영하기 때문에, 실시간 변동이 아닌 주기적인
            업데이트 방식입니다.
          </p>

          <h3>새 도메인의 DA는 몇 점인가요?</h3>
          <p>
            새로 등록한 도메인의 DA는 1점에서 시작합니다. 백링크가 전혀 없는 상태이므로
            최저 점수가 부여되며, 양질의 콘텐츠를 게시하고 자연스러운 백링크를 확보하면서
            점차 올라갑니다. 일반적으로 DA 10까지 도달하는 데 6개월~1년 이상이 걸립니다.
          </p>

          <h3>DA를 빨리 올리는 방법이 있나요?</h3>
          <p>
            DA를 단기간에 급격히 올리는 정당한 방법은 없습니다. 유료 링크 구매나
            PBN(Private Blog Network)은 오히려 스팸 점수를 높이고 검색엔진 패널티를
            받을 수 있습니다. 양질의 콘텐츠 제작, 자연스러운 백링크 확보, 기술적 SEO
            최적화를 꾸준히 실천하는 것이 유일한 방법입니다.
          </p>

          <h3>DA와 PA의 차이는 무엇인가요?</h3>
          <p>
            DA(Domain Authority)는 도메인 전체의 권위도를, PA(Page Authority)는 개별
            페이지의 권위도를 측정합니다. DA가 높은 도메인에서도 특정 페이지의 PA는 낮을 수
            있으며, 그 반대도 가능합니다. 도메인 투자에서는 주로 DA를 기준으로 평가합니다.
          </p>
        </section>

        <div className="blog-related">
          <h3 className="text-lg font-semibold mb-4">관련 글</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/blog/how-to-choose-domain" className="blog-related-card">
              <p className="font-medium text-sm">좋은 도메인 고르는 법 — 5가지 기준</p>
              <p className="text-xs text-muted-foreground mt-1">DA/DR, TLD, 도메인 나이 등 투자 가치 있는 도메인을 고르는 핵심 기준을 정리합니다.</p>
            </Link>
            <Link href="/blog/domain-auction-guide" className="blog-related-card">
              <p className="font-medium text-sm">도메인 경매 완벽 가이드</p>
              <p className="text-xs text-muted-foreground mt-1">경매 플랫폼 비교부터 입찰 전략, 낙찰 후 절차까지 한 번에 알아보세요.</p>
            </Link>
            <Link href="/blog/domain-spam-score-check" className="blog-related-card">
              <p className="font-medium text-sm">도메인 스팸 점수 확인 방법</p>
              <p className="text-xs text-muted-foreground mt-1">스팸 점수가 높아지는 원인과 낮추는 방법을 실전 가이드로 정리했습니다.</p>
            </Link>
          </div>
        </div>

        <div className="blog-cta">
          <p className="text-lg font-semibold">도메인의 DA를 확인해 보세요</p>
          <p className="mt-1 text-sm text-muted-foreground">
            도메인체커에서 DA, DR, TF를 포함한 주요 SEO 지수를 무료로 분석할 수 있습니다.
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
