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

export default function DomainSpamScoreCheckPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
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
                    text: "스팸 점수는 도메인이 검색엔진에서 스팸으로 분류될 가능성을 0~100% 사이로 수치화한 지표입니다. 백링크 품질, 콘텐츠 상태, 사이트 구조 등 여러 요소를 종합해 산출하며, 검색엔진 공식 지표가 아닌 외부 분석 도구의 추정 점수입니다.",
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
          ]),
        }}
      />

      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> 블로그 목록
      </Link>

      <h1 className="text-3xl font-bold tracking-tight leading-tight">
        도메인 스팸 점수 확인 방법 — 내 도메인이 스팸으로 분류되고 있는지
        점검하기
      </h1>

      <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            스팸 점수란 무엇인가
          </h2>
          <p>
            스팸 점수(Spam Score)는 특정 도메인이 검색엔진에서 스팸으로 분류될
            가능성을 수치화한 지표입니다. 일반적으로 0%에서 100% 사이로
            표시되며, 숫자가 높을수록 스팸 특성이 강하다고 판단됩니다.
          </p>
          <p className="mt-3">
            이 지표는 도메인의 백링크 패턴, 콘텐츠 품질, 사이트 구조 등 여러
            신호를 종합해 산출합니다. 검색엔진이 직접 제공하는 점수가 아니라
            외부 분석 도구가 추정하는 위험도 지표라는 점을 이해해야 합니다.
          </p>
          <p className="mt-3">
            쉽게 비유하면, 스팸 점수는 도메인의 "신용등급"과 비슷합니다.
            신용등급이 낮으면 대출이 어렵듯, 스팸 점수가 높으면 검색엔진이
            해당 사이트를 신뢰하기 어렵다고 볼 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            스팸 점수가 높아지는 주요 원인
          </h2>
          <p>
            스팸 점수가 올라가는 데는 여러 원인이 있습니다. 아래는 실무에서
            자주 발견되는 패턴입니다.
          </p>

          <h3 className="mb-2 mt-5 text-lg font-semibold text-foreground">
            저품질 백링크 과다
          </h3>
          <p>
            가장 흔한 원인입니다. 출처가 불분명한 사이트, 링크팜, 자동 생성된
            디렉토리에서 대량으로 백링크가 걸려 있으면 스팸 점수가 급격히
            올라갑니다. 특히 중고 도메인을 구매했을 때 이전 소유자가 남긴
            저품질 링크가 문제가 되는 경우가 많습니다.
          </p>

          <h3 className="mb-2 mt-5 text-lg font-semibold text-foreground">
            콘텐츠 부재 또는 저품질
          </h3>
          <p>
            도메인은 존재하는데 실제 콘텐츠가 거의 없거나, 자동 생성된
            텍스트로 채워져 있는 경우입니다. 검색엔진은 이런 사이트를 스팸
            가능성이 높다고 판단합니다.
          </p>

          <h3 className="mb-2 mt-5 text-lg font-semibold text-foreground">
            비정상적 앵커 텍스트 분포
          </h3>
          <p>
            백링크의 앵커 텍스트가 지나치게 특정 키워드에 집중되어 있으면
            인위적 링크 조작으로 의심받을 수 있습니다. 자연스러운 링크
            프로필이라면 브랜드명, URL, 다양한 키워드가 골고루 섞여야 합니다.
          </p>

          <h3 className="mb-2 mt-5 text-lg font-semibold text-foreground">
            과거 스팸 이력
          </h3>
          <p>
            도메인이 과거에 스팸 사이트로 운영된 적이 있으면, 소유자가
            바뀌어도 그 흔적이 남아 있을 수 있습니다. 이런 이력은{" "}
            <Link href="/" className="text-primary hover:underline">
              Wayback Machine
            </Link>
            이나 도메인 분석 도구를 통해 확인할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            도메인 스팸 점수 확인하는 방법
          </h2>
          <p>스팸 점수를 확인하는 방법은 크게 세 가지입니다.</p>

          <h3 className="mb-2 mt-5 text-lg font-semibold text-foreground">
            방법 1: 도메인 분석 도구 활용
          </h3>
          <p>
            가장 간편한 방법입니다.{" "}
            <Link href="/" className="text-primary hover:underline">
              도메인체커
            </Link>
            처럼 도메인명만 입력하면 DA, DR 등 주요 SEO 지표와 함께 스팸
            점수까지 한눈에 확인할 수 있는 도구를 사용하면 됩니다. 스팸 점수는
            보통 Pro 등급에서 제공되는 심화 지표에 해당합니다.
          </p>

          <h3 className="mb-2 mt-5 text-lg font-semibold text-foreground">
            방법 2: 백링크 프로필 수동 점검
          </h3>
          <p>
            직접 백링크 목록을 확인하고, 출처가 의심스러운 링크가 얼마나
            있는지 수동으로 파악하는 방법입니다. 시간이 많이 걸리지만
            정확합니다.
          </p>

          <h3 className="mb-2 mt-5 text-lg font-semibold text-foreground">
            방법 3: Google Search Console 활용
          </h3>
          <p>
            Google Search Console의 "링크" 보고서에서 외부 링크를 확인할 수
            있습니다. 직접적인 스팸 점수는 제공하지 않지만, 어떤 사이트에서
            링크가 오는지 파악하는 데 유용합니다.
          </p>

          <p className="mt-3">
            실무에서는 방법 1로 빠르게 전체 스팸 점수를 확인한 뒤, 점수가
            높으면 방법 2와 3을 병행해 원인을 구체적으로 파악하는 순서를
            추천합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            스팸 점수 기준 — 몇 점부터 위험한가
          </h2>
          <p className="mb-4">
            스팸 점수의 위험 수준을 구간별로 정리하면 다음과 같습니다.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    구간
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    의미
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    조치
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 font-medium text-foreground">
                    0~30%
                  </td>
                  <td className="px-4 py-3">안전</td>
                  <td className="px-4 py-3">특별한 조치 불필요</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 font-medium text-foreground">
                    31~60%
                  </td>
                  <td className="px-4 py-3">주의</td>
                  <td className="px-4 py-3">백링크 프로필 점검 권장</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-foreground">
                    61~100%
                  </td>
                  <td className="px-4 py-3">위험</td>
                  <td className="px-4 py-3">즉시 원인 파악 + 디스어보우 검토</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4">
            다만 스팸 점수는 절대적인 기준이 아닙니다. 30% 이하라도 특정
            저품질 링크가 문제가 될 수 있고, 60% 이상이라도 일시적 요인일 수
            있습니다. 중요한 것은 추세와 원인 파악입니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            스팸 점수 낮추기 실전 체크리스트
          </h2>
          <p>스팸 점수가 높다면 아래 순서대로 점검하고 조치하세요.</p>

          <h3 className="mb-2 mt-5 text-lg font-semibold text-foreground">
            1단계: 백링크 목록 전체 확인
          </h3>
          <p>
            현재 도메인에 연결된 모든 외부 링크를 확인합니다. 도메인 분석
            도구나 Google Search Console에서 목록을 추출할 수 있습니다.
          </p>

          <h3 className="mb-2 mt-5 text-lg font-semibold text-foreground">
            2단계: 저품질 링크 식별
          </h3>
          <p>아래 특징을 가진 링크를 골라내세요.</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              출처 사이트의{" "}
              <Link
                href="/blog/what-is-da"
                className="text-primary hover:underline"
              >
                DA(도메인 권위도)
              </Link>
              가 극단적으로 낮음
            </li>
            <li>링크가 자동 생성된 디렉토리나 댓글에서 발생</li>
            <li>사이트 언어나 주제가 내 사이트와 전혀 관련 없음</li>
            <li>동일 IP 대역에서 대량으로 발생한 링크</li>
          </ul>

          <h3 className="mb-2 mt-5 text-lg font-semibold text-foreground">
            3단계: 링크 제거 요청 또는 디스어보우(Disavow)
          </h3>
          <p>
            저품질 링크의 출처 사이트 운영자에게 링크 제거를 요청하는 것이
            우선입니다. 응답이 없거나 제거가 불가능한 경우, Google의 디스어보우
            도구를 통해 해당 링크를 무시하도록 요청할 수 있습니다.
          </p>

          <h3 className="mb-2 mt-5 text-lg font-semibold text-foreground">
            4단계: 콘텐츠 보강
          </h3>
          <p>
            사이트에 유용한 콘텐츠를 지속적으로 추가하세요. 양질의 콘텐츠가
            쌓이면 전체적인 사이트 신뢰도가 올라가고, 상대적으로 스팸 신호의
            비중이 줄어듭니다.
          </p>

          <h3 className="mb-2 mt-5 text-lg font-semibold text-foreground">
            5단계: 정기적 모니터링
          </h3>
          <p>
            스팸 점수는 한 번 낮추고 끝이 아닙니다. 새로운 저품질 백링크가
            언제든 생길 수 있으므로, 월 1회 정도 정기적으로 확인하는 습관이
            필요합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            중고 도메인 구매 시 스팸 점수 확인이 중요한 이유
          </h2>
          <p>
            도메인 투자나 프로젝트를 위해 중고 도메인을 구매할 때, 스팸 점수
            확인은 필수입니다.
          </p>
          <p className="mt-3">
            겉보기에 DA가 높고 백링크가 많아 보이는 도메인이라도, 스팸 점수가
            높다면 그 지표들이 인위적으로 부풀려졌을 가능성이 있습니다. 이런
            도메인을 구매하면 오히려 SEO에 악영향을 받을 수 있습니다.
          </p>
          <p className="mt-3">
            중고 도메인을 검토할 때는{" "}
            <Link
              href="/tools/domain-value"
              className="text-primary hover:underline"
            >
              도메인 가치 평가 도구
            </Link>
            로 전반적인 품질을 확인하고, 스팸 점수와 백링크 프로필까지 함께
            점검하는 것을 권장합니다. DA만 보고 판단하면 실패할 확률이
            높습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            요약 및 다음 단계
          </h2>
          <p>핵심 내용을 정리하면 다음과 같습니다.</p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>
              <strong className="text-foreground">스팸 점수</strong>는 도메인이
              스팸으로 분류될 위험도를 나타내는 지표입니다
            </li>
            <li>
              <strong className="text-foreground">주요 원인</strong>은 저품질
              백링크, 콘텐츠 부재, 비정상적 앵커 텍스트 분포입니다
            </li>
            <li>
              <strong className="text-foreground">60% 이상</strong>이면 즉시
              원인 파악과 조치가 필요합니다
            </li>
            <li>
              <strong className="text-foreground">디스어보우</strong>와 콘텐츠
              보강을 병행하면 점진적으로 개선할 수 있습니다
            </li>
            <li>
              <strong className="text-foreground">중고 도메인 구매 전</strong>{" "}
              반드시 스팸 점수를 확인하세요
            </li>
          </ul>
          <p className="mt-4">
            아직 내 도메인의 스팸 점수를 확인해 본 적이 없다면, 지금 바로{" "}
            <Link href="/" className="text-primary hover:underline">
              도메인체커
            </Link>
            에서 도메인을 검색해 보세요. DA, DR 등 기본 지표는 무료로 확인할
            수 있고, 스팸 점수를 포함한 심화 분석은 Pro에서 제공됩니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">FAQ</h2>

          <div className="space-y-5">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                스팸 점수란 정확히 무엇인가요?
              </h3>
              <p>
                스팸 점수는 도메인이 검색엔진에서 스팸으로 분류될 가능성을
                0~100% 사이로 수치화한 지표입니다. 백링크 품질, 콘텐츠 상태,
                사이트 구조 등 여러 요소를 종합해 산출하며, 검색엔진 공식
                지표가 아닌 외부 분석 도구의 추정 점수입니다.
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                스팸 점수가 높으면 검색 순위가 떨어지나요?
              </h3>
              <p>
                스팸 점수 자체가 Google 순위에 직접 반영되지는 않습니다. 다만
                스팸 점수가 높다는 것은 저품질 백링크가 많거나 사이트 신뢰도에
                문제가 있다는 신호이므로, 간접적으로 검색 순위에 부정적 영향을
                줄 수 있습니다.
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                스팸 점수를 무료로 확인할 수 있나요?
              </h3>
              <p>
                기본적인 도메인 지표(DA, DR 등)는 무료 도구로 확인할 수
                있습니다. 스팸 점수는 보통 유료 또는 Pro 등급에서 제공되는
                심화 지표입니다. 도메인체커에서도 기본 분석은 무료이며, 스팸
                점수는 Pro 기능으로 제공됩니다.
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                디스어보우(Disavow)를 하면 스팸 점수가 바로 내려가나요?
              </h3>
              <p>
                디스어보우를 제출한다고 즉시 점수가 변하지는 않습니다. Google이
                해당 링크를 처리하는 데 수 주에서 수 개월이 걸릴 수 있으며,
                외부 분석 도구의 점수 반영에도 시간이 필요합니다. 꾸준한
                모니터링이 중요합니다.
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                새 도메인도 스팸 점수가 높을 수 있나요?
              </h3>
              <p>
                드물지만 가능합니다. 새 도메인이라도 스팸 사이트에서
                일방적으로 백링크를 보내면 점수가 올라갈 수 있습니다. 이를
                "네거티브 SEO"라고 부르며, 발견 즉시 디스어보우로 대응하는
                것이 좋습니다.
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-12 rounded-xl border bg-muted/30 p-6 text-center">
        <p className="text-lg font-semibold">도메인의 스팸 점수를 확인해 보세요</p>
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
