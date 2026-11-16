import { calcQuote, formatYuan, PRICE_PER_PAGE, PRICE_PER_WEEK } from "@/lib/geo-calc";
import type { QuoteConfig } from "@/lib/geo-data";

/** One price table for both the quotation page and the proposal, so amounts can never diverge. */
export function QuoteDetails({ config }: { config: QuoteConfig }) {
  const q = calcQuote(config);
  return (
    <>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>服务项目</th>
              <th>配置 / 数量</th>
              <th>单价</th>
              <th>金额</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>内容建设</td>
              <td>
                {q.scenes} 个场景 × {q.languageCount} 个语种 = {q.pages} 页
              </td>
              <td>{formatYuan(PRICE_PER_PAGE)} / 页</td>
              <td data-testid="content-fee">{formatYuan(q.contentFee)}</td>
            </tr>
            <tr>
              <td>专项监测</td>
              <td>{q.weeks} 周</td>
              <td>{formatYuan(PRICE_PER_WEEK)} / 周</td>
              <td data-testid="monitoring-fee">{formatYuan(q.monitoringFee)}</td>
            </tr>
            <tr>
              <td>PR 服务</td>
              <td>{config.pr}</td>
              <td>待确认</td>
              <td>{config.pr === "不包含" ? "—" : "待确认"}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}>已确认小计</td>
              <td className="highlight" data-testid="subtotal">
                {formatYuan(q.subtotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="table-footnote">
        内容覆盖周期：{config.contentMonths} 个月（不参与计费）。PR 金额待确认，不计入已确认小计。所有金额为人民币、不含税。
      </p>
    </>
  );
}
