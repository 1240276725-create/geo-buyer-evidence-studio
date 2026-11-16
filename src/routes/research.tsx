import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  CircleAlert,
  CircleCheck,
  ExternalLink,
  Pencil,
  Plus,
  Save,
  SearchX,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NextStep, PageHeading, SectionHeading } from "@/components/workspace/headings";
import { groupEvidence } from "@/lib/geo-calc";
import {
  EVIDENCE_TYPE_META,
  PENDING_EVIDENCE,
  UNVERIFIED,
  type Evidence,
  type EvidenceType,
} from "@/lib/geo-data";
import { summarizeResearch } from "@/lib/proposal";
import { useWorkspace } from "@/lib/workspace-store";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "买家调研 · GEO 售前助手" },
      {
        name: "description",
        content: "录入、编辑和分类买家调研证据，区分直接证据、间接证据与证据缺口。",
      },
      { property: "og:title", content: "买家调研 · GEO 售前助手" },
      {
        property: "og:description",
        content: "美国工业采购人群是否使用 AI 寻找供应商？以可追溯证据回答。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResearchPage,
});

type Draft = Omit<Evidence, "id">;
const EMPTY: Draft = {
  title: "",
  source: "",
  url: "",
  date: "",
  audience: "",
  conclusion: "",
  type: "indirect",
  supports: "",
  limitation: "",
};
const TYPES: EvidenceType[] = ["direct", "indirect", "gap"];

function orUnverified(v: string) {
  return v.trim() ? v : UNVERIFIED;
}

function ResearchPage() {
  const { evidence, setEvidence } = useWorkspace();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const groups = groupEvidence(evidence);
  const summary = summarizeResearch(evidence);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft({ ...draft, [key]: value });
    setError("");
  };
  const reset = () => {
    setDraft(EMPTY);
    setEditingId(null);
    setError("");
  };
  const startEdit = (e: Evidence) => {
    const { id, ...rest } = e;
    setDraft(rest);
    setEditingId(id);
    setError("");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const clean: Draft = Object.fromEntries(
      Object.entries(draft).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]),
    ) as Draft;
    if (!clean.title) return setError("请填写证据标题");
    if (clean.type !== "gap" && !clean.url) return setError("直接证据和间接证据必须填写来源链接");
    if (clean.type !== "gap" && !clean.conclusion) return setError("请填写结论");
    if (clean.type === "gap" && !clean.conclusion) clean.conclusion = PENDING_EVIDENCE;
    if (editingId) {
      setEvidence(evidence.map((e) => (e.id === editingId ? { ...clean, id: editingId } : e)));
      toast.success("证据已更新");
    } else {
      setEvidence([...evidence, { ...clean, id: crypto.randomUUID() }]);
      toast.success("证据已添加");
    }
    reset();
  };

  const remove = (e: Evidence) => {
    setEvidence(evidence.filter((x) => x.id !== e.id));
    if (editingId === e.id) reset();
    toast("证据已删除", { description: e.title });
  };

  const urlRequired = draft.type !== "gap";

  return (
    <>
      <PageHeading
        label="BUYER RESEARCH"
        title="买家调研"
        description="美国目标工业采购人群是否会使用 AI 寻找供应商？以可追溯的证据回答，不夸大结论。"
        action={<span className="pending-tag">{evidence.length} 条调研记录</span>}
      />

      <div className="research-verdict" role="note">
        <strong>当前判断：</strong>
        {summary.verdict}
      </div>

      <div className="research-summary">
        <section className="panel">
          <h3>
            <CircleCheck size={15} className="text-success" />
            证据支持的判断
          </h3>
          {summary.supports.length ? (
            <ul>
              {summary.supports.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          ) : (
            <p className="pending-evidence">{PENDING_EVIDENCE}</p>
          )}
        </section>
        <section className="panel">
          <h3>
            <CircleAlert size={15} className="text-warm" />
            证据局限
          </h3>
          {summary.limitations.length ? (
            <ul>
              {summary.limitations.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          ) : (
            <p className="pending-evidence">{PENDING_EVIDENCE}</p>
          )}
        </section>
        <section className="panel">
          <h3>
            <SearchX size={15} className="text-warm" />
            待补充证据
          </h3>
          {groups.gap.length ? (
            <ul>
              {groups.gap.map((g) => (
                <li key={g.id}>{g.title}</li>
              ))}
            </ul>
          ) : (
            <p>暂无已登记的证据缺口</p>
          )}
        </section>
      </div>

      <SectionHeading
        title={editingId ? "编辑调研证据" : "录入调研证据"}
        subtitle="来源、调查对象与证据类型"
        extra={editingId ? <span className="pending-tag">正在编辑</span> : undefined}
      />
      <form ref={formRef} className={`form-section ${editingId ? "is-editing" : ""}`} onSubmit={submit} noValidate>
        <div className="form-grid">
          <div className="field-wide">
            <span className="field-label">
              证据类型 <span>*</span>
            </span>
            <div className="type-options" role="radiogroup" aria-label="证据类型">
              {TYPES.map((t) => (
                <label key={t} className={`type-option ${draft.type === t ? "is-selected" : ""}`}>
                  <input
                    type="radio"
                    name="evidence-type"
                    value={t}
                    checked={draft.type === t}
                    onChange={() => set("type", t)}
                  />
                  <span>
                    <strong>{EVIDENCE_TYPE_META[t].label}</strong>
                    <small>{EVIDENCE_TYPE_META[t].rule}</small>
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="field-wide">
            <label className="field-label" htmlFor="e-title">
              {draft.type === "gap" ? "缺口问题" : "证据标题"} <span>*</span>
            </label>
            <Input
              id="e-title"
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder={draft.type === "gap" ? "例如：目标人群是否使用 AI 比较供应商报价" : "研究或报告的原始标题"}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="e-source">
              研究机构 / 来源
            </label>
            <Input
              id="e-source"
              value={draft.source}
              onChange={(e) => set("source", e.target.value)}
              placeholder="例如：Google × National Research Group"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="e-url">
              来源链接 {urlRequired && <span>*</span>}
            </label>
            <Input
              id="e-url"
              type="url"
              value={draft.url}
              onChange={(e) => set("url", e.target.value)}
              placeholder="https://"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="e-date">
              日期
            </label>
            <Input
              id="e-date"
              value={draft.date}
              onChange={(e) => set("date", e.target.value)}
              placeholder="例如：2025年10月"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="e-audience">
              调查对象
            </label>
            <Input
              id="e-audience"
              value={draft.audience}
              onChange={(e) => set("audience", e.target.value)}
              placeholder="例如：美国 B2B 采购决策参与者"
            />
          </div>
          <div className="field-wide">
            <label className="field-label" htmlFor="e-conclusion">
              结论 {urlRequired && <span>*</span>}
            </label>
            <Textarea
              id="e-conclusion"
              value={draft.conclusion}
              onChange={(e) => set("conclusion", e.target.value)}
              placeholder={draft.type === "gap" ? `留空则显示「${PENDING_EVIDENCE}」` : "只记录原文可核验的结论，不要推断"}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="e-supports">
              支持判断
            </label>
            <Textarea
              id="e-supports"
              value={draft.supports}
              onChange={(e) => set("supports", e.target.value)}
              placeholder="这条证据能支持什么判断"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="e-limitation">
              局限
            </label>
            <Textarea
              id="e-limitation"
              value={draft.limitation}
              onChange={(e) => set("limitation", e.target.value)}
              placeholder="这条证据不能证明什么"
            />
          </div>
        </div>
        <div className="form-actions">
          <span role="status" className="notice form-error">
            {error}
          </span>
          <Button variant="outline" type="button" onClick={reset}>
            {editingId ? "取消编辑" : "清空"}
          </Button>
          <Button type="submit">
            {editingId ? <Save /> : <Plus />}
            {editingId ? "保存修改" : "添加证据"}
          </Button>
        </div>
      </form>

      <section className="evidence-section">
        <SectionHeading
          title="已录入证据"
          extra={<span className="section-extra">共 {evidence.length} 条 · 按证据类型分组</span>}
        />
        {TYPES.map((t) => {
          const list = groups[t];
          return (
            <div className="evidence-group" key={t}>
              <div className="evidence-group-title">
                <span className={`evidence-type ${t}`}>{EVIDENCE_TYPE_META[t].label}</span>
                {list.length} 条<small>{EVIDENCE_TYPE_META[t].rule}</small>
              </div>
              {list.length === 0 ? (
                <div className="evidence-card is-gap">
                  <p className="pending-evidence">
                    {t === "direct"
                      ? `${PENDING_EVIDENCE}：暂无能直接证明美国目标工业采购人群使用 AI 寻找供应商的研究。`
                      : PENDING_EVIDENCE}
                  </p>
                </div>
              ) : (
                <div className="evidence-grid">
                  {list.map((e) => (
                    <EvidenceCard key={e.id} evidence={e} onEdit={() => startEdit(e)} onDelete={() => remove(e)} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>

      <div className="mt-7">
        <NextStep
          to="/quotation"
          title="下一步，配置服务需求"
          subtitle="结合调研证据，明确采购场景与服务交付范围。"
        />
      </div>
    </>
  );
}

function EvidenceCard({
  evidence: e,
  onEdit,
  onDelete,
}: {
  evidence: Evidence;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isGap = e.type === "gap";
  return (
    <article className={`evidence-card ${isGap ? "is-gap" : ""}`}>
      <div className="evidence-card-heading">
        <span>{isGap ? <SearchX size={17} /> : <BookOpen size={17} />}</span>
        <h3>{e.title}</h3>
        <div className="evidence-actions">
          <Button variant="ghost" size="icon" aria-label={`编辑证据：${e.title}`} title="编辑" onClick={onEdit}>
            <Pencil size={15} />
          </Button>
          <Button variant="ghost" size="icon" aria-label={`删除证据：${e.title}`} title="删除" onClick={onDelete}>
            <Trash2 size={15} />
          </Button>
        </div>
      </div>
      <div className="evidence-meta">
        <span className={`evidence-type ${e.type}`}>{EVIDENCE_TYPE_META[e.type].label}</span>
        {!isGap && <span>{orUnverified(e.source)}</span>}
        {!isGap && <span>{orUnverified(e.date)}</span>}
        <span>{orUnverified(e.audience)}</span>
      </div>
      <p className={e.conclusion === PENDING_EVIDENCE ? "pending-evidence" : undefined}>{e.conclusion}</p>
      <dl className="evidence-fields">
        {!isGap && (
          <div>
            <dt>支持判断</dt>
            <dd>{e.supports || <span className="unverified">{UNVERIFIED}</span>}</dd>
          </div>
        )}
        <div>
          <dt>{isGap ? "缺口说明" : "局限"}</dt>
          <dd>{e.limitation || <span className="unverified">{UNVERIFIED}</span>}</dd>
        </div>
      </dl>
      {e.url ? (
        <a className="source-link" href={e.url} target="_blank" rel="noopener noreferrer">
          查看来源 <ExternalLink size={11} />
        </a>
      ) : (
        <span className="source-link pending-evidence">来源：{PENDING_EVIDENCE}</span>
      )}
    </article>
  );
}
