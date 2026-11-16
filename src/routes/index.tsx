import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownToLine,
  Building2,
  CircleCheck,
  Earth,
  Info,
  Layers,
  MessageSquare,
  Package,
  Pencil,
  RotateCcw,
  ScanLine,
  Search,
  ShieldCheck,
  TriangleAlert,
  Check,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { NextStep, PageHeading, SectionHeading } from "@/components/workspace/headings";
import { diagnose, formatRate, NO_DATA, sumRows, validationRules } from "@/lib/geo-calc";
import type { PlatformRow } from "@/lib/geo-data";
import { cloneDefaultMonitoring, useWorkspace } from "@/lib/workspace-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "数据诊断 · GEO 售前助手" },
      {
        name: "description",
        content: "查看客户的 ChatGPT 与 Google AI 搜索监测数据，计算品牌与竞品提及率，开展 GEO 售前诊断。",
      },
      { property: "og:title", content: "数据诊断 · GEO 售前助手" },
      {
        property: "og:description",
        content: "ChatGPT 与 Google AI 品牌提及率诊断，展示分子、分母与校验规则。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DiagnosisPage,
});

const FIELDS: { key: keyof Omit<PlatformRow, "platform">; label: string }[] = [
  { key: "queries", label: "发起查询" },
  { key: "answers", label: "有效回答" },
  { key: "brand", label: "本品牌提及" },
  { key: "competitor", label: "竞品 A 提及" },
];

function rateNote(mentions: number, answers: number, rate: number | null, hasErrors: boolean) {
  if (rate !== null) return `${mentions}/${answers}=${formatRate(rate)}`;
  return hasErrors ? "数据异常，暂不计算" : `有效回答为 0，${NO_DATA}`;
}

function DiagnosisPage() {
  const { project, monitoring, setMonitoring } = useWorkspace();
  const [editing, setEditing] = useState(false);
  const result = diagnose(monitoring);
  const rules = validationRules(monitoring);
  const total = sumRows(monitoring);
  const [a, b] = monitoring;

  const updateCell = (index: number, key: keyof Omit<PlatformRow, "platform">, raw: string) => {
    const value = raw === "" ? Number.NaN : Number(raw);
    setMonitoring(monitoring.map((r, i) => (i === index ? { ...r, [key]: value } : r)));
  };

  const exportCsv = () => {
    const csv =
      "\ufeff平台,发起查询,有效回答,本品牌提及,竞品A提及,本品牌提及率,竞品A提及率\n" +
      [...result.platforms, result.overall]
        .map((r) =>
          [r.platform, r.queries, r.answers, r.brand, r.competitor, formatRate(r.brandRate), formatRate(r.competitorRate)].join(","),
        )
        .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project}-监测数据.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const maxMention = Math.max(100, ...monitoring.flatMap((r) => [r.brand, r.competitor]).filter(Number.isFinite));
  const scale = Math.ceil(maxMention / 25) * 25;
  const pct = (v: number) => `${Math.min(100, Math.max(0, Number.isFinite(v) ? (v / scale) * 100 : 0))}%`;

  const metrics = [
    { label: "发起查询", value: total.queries, unit: "次", note: monitoring.map((r) => `${r.platform} ${r.queries}`).join(" · "), icon: Search },
    { label: "有效回答", value: total.answers, unit: "条", note: monitoring.map((r) => `${r.platform} ${r.answers}`).join(" · "), icon: MessageSquare },
    { label: "本品牌提及", value: total.brand, unit: "次", note: monitoring.map((r) => `${r.platform} ${r.brand}`).join(" · "), icon: ScanLine },
    { label: "竞品 A 提及", value: total.competitor, unit: "次", note: monitoring.map((r) => `${r.platform} ${r.competitor}`).join(" · "), icon: Layers },
  ];

  return (
    <>
      <PageHeading
        label="DATA DIAGNOSIS"
        title="数据诊断"
        description="从 AI 搜索表现出发，了解客户品牌在目标市场的可见度。"
        action={
          <Button variant="outline" onClick={exportCsv}>
            <ArrowDownToLine /> 导出监测数据
          </Button>
        }
      />

      <section className="info-band" aria-label="客户信息">
        {[
          { icon: Building2, label: "所属行业", value: "工业设备" },
          { icon: Earth, label: "目标市场", value: "美国" },
          { icon: Package, label: "核心产品", value: "集装箱篷房" },
          { icon: Info, label: "目标客户", value: "工厂、仓库、设备租赁公司采购负责人" },
        ].map((item) => (
          <div className="info-item" key={item.label}>
            <span>
              <item.icon size={13} />
              {item.label}
            </span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </section>

      <SectionHeading
        title="监测概览"
        extra={
          <span className="section-extra">
            <span className="status-dot" />
            模拟数据<span>·</span>
            {monitoring.length} 个 AI 搜索平台
          </span>
        }
      />
      <div className="metric-grid">
        {metrics.map((m) => (
          <article className="metric" key={m.label}>
            <div className="metric-label">
              {m.label}
              <m.icon />
            </div>
            <div className="metric-value">
              {Number.isFinite(m.value) ? m.value : "—"}
              <span>{m.unit}</span>
            </div>
            <div className="metric-bottom">
              <span className="metric-dot" />
              {m.note}
            </div>
          </article>
        ))}
      </div>

      <section className="mention-analysis" aria-label="品牌提及率分析">
        <SectionHeading
          title="品牌提及率分析"
          extra={
            <span className={`section-extra ${result.errors.length ? "text-destructive" : "text-success"}`}>
              {result.errors.length ? <TriangleAlert size={13} /> : <CircleCheck size={13} />}
              {result.errors.length ? "数据校验未通过" : "数据校验通过"}
            </span>
          }
        />
        <div className="mention-grid">
          {[...result.platforms, result.overall].map((r, i) => (
            <article
              key={r.platform}
              className={`mention-card ${i === result.platforms.length ? "mention-overall" : ""}`}
            >
              <div className="mention-card-heading">
                <h3>{r.platform}</h3>
                <span>{Number.isFinite(r.answers) ? r.answers : "—"} 条有效回答</span>
              </div>
              <div className="mention-rates">
                <div>
                  <span className="mention-label">
                    <i className="legend-dot" />
                    本品牌
                  </span>
                  <strong className="text-primary">{formatRate(r.brandRate)}</strong>
                  <p>{rateNote(r.brand, r.answers, r.brandRate, r.errors.length > 0)}</p>
                </div>
                <div>
                  <span className="mention-label">
                    <i className="legend-dot competitor" />
                    竞品 A
                  </span>
                  <strong>{formatRate(r.competitorRate)}</strong>
                  <p>{rateNote(r.competitor, r.answers, r.competitorRate, r.errors.length > 0)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        <p className="table-footnote">
          <Info size={12} />
          整体按提及数量之和 ÷ 有效回答数量之和计算，不直接平均平台百分比。
        </p>

        <div className="validation-rules" aria-label="数据校验规则">
          <h3>
            <ShieldCheck size={14} />
            数据校验规则
          </h3>
          <ul>
            {rules.map((rule, i) => (
              <li key={rule.name} className={`validation-rule ${rule.pass ? "" : "is-failing"}`}>
                <div className="validation-rule-head">
                  <span className="validation-rule-index">{i + 1}</span>
                  <strong>{rule.name}</strong>
                  <span className={`validation-status ${rule.pass ? "text-success" : "text-destructive"}`}>
                    {rule.pass ? <CircleCheck size={12} /> : <TriangleAlert size={12} />}
                    {rule.pass ? "通过" : "异常"}
                  </span>
                </div>
                <p>{rule.description}</p>
                <p className="validation-check">{rule.check}</p>
                {!rule.pass && (
                  <ul className="validation-issues" role="alert">
                    {rule.issues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="diagnosis-conclusions">
          <h3>数据诊断结论</h3>
          <ul>
            {result.conclusions.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p className="diagnosis-disclaimer">
            <Info size={14} />
            <span>
              监测数据只能反映当前样本中的品牌提及情况，不能直接证明实际市场份额、客户转化率或消费者采购意愿。
            </span>
          </p>
        </div>
      </section>

      <div className="chart-grid">
        <section className="panel">
          <SectionHeading
            title="品牌提及对比"
            extra={
              <div className="legend">
                <span>
                  <i className="legend-dot" />
                  本品牌
                </span>
                <span>
                  <i className="legend-dot competitor" />
                  竞品 A
                </span>
              </div>
            }
          />
          <div
            className="bar-chart"
            aria-label={monitoring.map((r) => `${r.platform} 本品牌${r.brand}次，竞品${r.competitor}次`).join("；")}
          >
            <div className="axis-labels">
              {[4, 3, 2, 1, 0].map((s) => (
                <span key={s}>{(scale / 4) * s}</span>
              ))}
            </div>
            <div className="bar-plot">
              {monitoring.map((r) => (
                <div className="bar-group" key={r.platform}>
                  <div className="bar" style={{ height: pct(r.brand) }}>
                    <span>{Number.isFinite(r.brand) ? r.brand : "—"}</span>
                  </div>
                  <div className="bar competitor" style={{ height: pct(r.competitor) }}>
                    <span>{Number.isFinite(r.competitor) ? r.competitor : "—"}</span>
                  </div>
                  <span className="bar-label">{r.platform}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-caption">
            <Info size={12} />
            提及次数 · 按 AI 搜索平台分组展示
          </div>
        </section>

        <section className="panel">
          <SectionHeading
            title="查询与回答分布"
            extra={<span className="section-extra">有效回答 / 发起查询</span>}
          />
          <div className="answer-rows">
            {monitoring.map((r, i) => {
              const fill = r.queries > 0 && Number.isFinite(r.answers) ? Math.min(100, (r.answers / r.queries) * 100) : 0;
              return (
                <div key={r.platform}>
                  <div className="answer-row-title">
                    <div className="platform-name">
                      <span className={`platform-mark ${i === 0 ? "chat" : "google"}`}>
                        {i === 0 ? <ScanLine size={17} /> : "G"}
                      </span>
                      {r.platform}
                    </div>
                    <span className="answer-count">
                      <strong>{r.answers}</strong> / {r.queries}
                    </span>
                  </div>
                  <div className="answer-track">
                    <div className={`answer-fill ${i === 1 ? "google" : ""}`} style={{ width: `${fill}%` }} />
                  </div>
                  <div className="answer-sub">
                    <span>有效回答 {r.answers} 条</span>
                    <span>发起查询 {r.queries} 次</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="chart-caption">
            <Info size={12} />
            {a && b && a.answers === b.answers
              ? `各平台有效回答数均为 ${a.answers} 条`
              : "失败、超时或空回答不计入有效回答"}
          </div>
        </section>
      </div>

      <section className="data-section">
        <SectionHeading
          title="平台监测明细"
          extra={
            <div className="section-actions">
              <span className="section-extra">数据来源：演示样例</span>
              {editing && (
                <Button variant="outline" size="sm" onClick={() => setMonitoring(cloneDefaultMonitoring())}>
                  <RotateCcw /> 恢复默认
                </Button>
              )}
              <Button variant={editing ? "default" : "outline"} size="sm" onClick={() => setEditing(!editing)}>
                {editing ? <Check /> : <Pencil />}
                {editing ? "完成编辑" : "编辑数据"}
              </Button>
            </div>
          }
        />
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>AI 搜索平台</th>
                {FIELDS.map((f) => (
                  <th key={f.key}>{f.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monitoring.map((r, i) => (
                <tr key={r.platform}>
                  <td>
                    <span className="platform-name">
                      <span className={`platform-mark ${i === 0 ? "chat" : "google"}`}>
                        {i === 0 ? <ScanLine size={16} /> : "G"}
                      </span>
                      {r.platform}
                    </span>
                  </td>
                  {FIELDS.map((f) => (
                    <td key={f.key} className={f.key === "brand" && !editing ? "highlight" : undefined}>
                      {editing ? (
                        <input
                          className="cell-input"
                          type="number"
                          min={0}
                          step={1}
                          aria-label={`${r.platform} ${f.label}`}
                          aria-invalid={result.platforms[i].errors.length > 0}
                          value={Number.isNaN(r[f.key]) ? "" : r[f.key]}
                          onChange={(e) => updateCell(i, f.key, e.target.value)}
                        />
                      ) : (
                        r[f.key]
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="table-footnote">
          <Info size={12} />
          当前数据为模拟监测样例，仅供售前演示使用。修改后，提及率、图表、诊断结论及客户方案同步更新。
        </p>
      </section>

      <NextStep
        to="/research"
        title="下一步，补充买家调研证据"
        subtitle="结合目标客户的真实采购需求，为后续服务方案提供依据。"
      />
    </>
  );
}
