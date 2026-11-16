import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BarChart3,
  Briefcase,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FileText,
  Layers,
  PanelLeft,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspace } from "@/lib/workspace-store";

const NAV = [
  { path: "/", label: "数据诊断", icon: BarChart3, step: "01" },
  { path: "/research", label: "买家调研", icon: Users, step: "02" },
  { path: "/quotation", label: "服务报价", icon: Wallet, step: "03" },
  { path: "/proposal", label: "客户方案", icon: FileText, step: "04" },
] as const;

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = NAV.find((n) => n.path === pathname) ?? NAV[0];
  const { project, setProject } = useWorkspace();
  const [collapsed, setCollapsed] = useState(false);
  const [dialog, setDialog] = useState<null | "project" | "help">(null);
  const [draft, setDraft] = useState(project);

  const openProject = () => {
    setDraft(project);
    setDialog("project");
  };

  return (
    <div className={`workspace ${collapsed ? "is-collapsed" : ""}`}>
      <aside className="workspace-sidebar">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <Layers size={23} />
          </span>
          <span className="brand-name">
            GEO<span>售前助手</span>
          </span>
        </Link>
        <div className="workspace-label">
          <span>销售工作台</span>
          <span className="small-tag">DEMO</span>
        </div>
        <nav className="nav-list">
          {NAV.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              asChild
              className={`nav-item ${pathname === item.path ? "active" : ""}`}
            >
              <Link to={item.path}>
                <item.icon size={19} />
                <span>{item.label}</span>
                <span className="nav-step">{item.step}</span>
              </Link>
            </Button>
          ))}
        </nav>
        <div className="sidebar-project">
          <div className="eyebrow">当前客户项目</div>
          <span className="project-symbol">
            <Briefcase size={18} />
          </span>
          <strong>{project}</strong>
          <div>
            <span className="status-dot" /> 售前进行中
          </div>
          <Button variant="ghost" className="project-manage" onClick={openProject}>
            项目设置 <ArrowUpRight size={14} />
          </Button>
        </div>
        <div className="sidebar-bottom">
          <Button variant="ghost" className="help-button" onClick={() => setDialog("help")}>
            <CircleHelp size={18} />
            <span>帮助中心</span>
            <ArrowUpRight size={14} />
          </Button>
          <div className="account">
            <span className="avatar">陈</span>
            <div>
              <strong>陈晓</strong>
              <span>销售顾问</span>
            </div>
            <span className="account-status" />
          </div>
        </div>
      </aside>

      <div className="workspace-main">
        <header className="topbar">
          <div className="breadcrumb">
            <Button
              variant="ghost"
              size="icon"
              aria-label={collapsed ? "展开导航" : "收起导航"}
              title={collapsed ? "展开导航" : "收起导航"}
              onClick={() => setCollapsed(!collapsed)}
            >
              <PanelLeft size={18} />
            </Button>
            <span>售前工作台</span>
            <ChevronRight size={14} />
            <strong>{current.label}</strong>
          </div>
          <div className="topbar-project">
            <span className="status-dot" />
            <span>{project}</span>
            <Button variant="ghost" size="icon" aria-label="修改客户项目" onClick={openProject}>
              <ChevronDown size={15} />
            </Button>
          </div>
          <span className="topbar-avatar avatar">陈</span>
        </header>
        <main className="page-content">{children}</main>
        <footer className="workspace-footer">
          <span>GEO 售前助手</span>
          <span>
            <span className="status-dot" /> 演示工作空间 <span className="footer-divider">/</span> v0.1
          </span>
        </footer>
      </div>

      {dialog && (
        <div className="modal-backdrop">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            className="workspace-modal"
          >
            <div className="section-heading">
              <h2 id="dialog-title">{dialog === "project" ? "客户项目设置" : "帮助中心"}</h2>
              <Button variant="ghost" size="icon" aria-label="关闭" onClick={() => setDialog(null)}>
                <X />
              </Button>
            </div>
            {dialog === "project" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (draft.trim()) {
                    setProject(draft.trim());
                    setDialog(null);
                  }
                }}
              >
                <label className="field-label" htmlFor="project-name">
                  客户项目名称
                </label>
                <Input
                  id="project-name"
                  value={draft}
                  required
                  onChange={(e) => setDraft(e.target.value)}
                />
                <div className="modal-actions">
                  <Button type="button" variant="outline" onClick={() => setDialog(null)}>
                    取消
                  </Button>
                  <Button type="submit">保存项目</Button>
                </div>
              </form>
            ) : (
              <>
                <p className="text-muted-foreground leading-7">
                  当前为模拟数据演示版本。四个模块共用同一份数据：修改监测数据、调研证据或报价参数后，客户方案会自动同步。录入内容仅在本次访问中保留，刷新页面后恢复默认数据。
                </p>
                <Button className="mt-5" onClick={() => setDialog(null)}>
                  知道了
                </Button>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
