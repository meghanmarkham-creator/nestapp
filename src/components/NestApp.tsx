"use client";

// The Nest — client-side view router (ported from App() in the prototype HTML).
// Single-page app with a simple state stack for drill-down navigation.
// TODO(routing): top-level views could be promoted to Next route segments later;
// the state stack mirrors the prototype's behavioral source of truth for now.

import { useState } from "react";
import { ToastHost } from "@/components/ui";
import { Dashboard } from "./views/Dashboard";
import { AIEfficiencyView } from "./views/AIEfficiency";
import { ClassAssignmentsView } from "./views/Assignments";
import { TrainersView } from "./views/Trainers";
import { ClassesView, ClassDetail } from "./views/Classes";
import { AdvocatesView, AdvocateDetail } from "./views/Advocates";
import { CoachingBoard } from "./views/CoachingBoard";
import { ReportCardsView, ArchiveView } from "./views/ReportCards";
import { CoachingDrawer } from "./views/CoachingDrawer";

interface Route {
  view: string;
  classId?: string;
  advId?: string;
}

export default function NestApp() {
  const [stack, setStack] = useState<Route[]>([{ view: "dash" }]);
  const [planId, setPlanId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const cur = stack[stack.length - 1];

  const nav = (key: string) => {
    setStack([{ view: key }]);
    window.scrollTo(0, 0);
  };
  const push = (r: Route) => {
    setStack((s) => [...s, r]);
    window.scrollTo(0, 0);
  };
  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));

  const openClass = (id: string) => push({ view: "classDetail", classId: id });
  const openAdvocate = (id: string) => push({ view: "advocateDetail", advId: id });
  const openPlan = (id: string) => setPlanId(id);
  const graduate = (classId: string) => push({ view: "report", classId });

  const onSearch = (v: string) => {
    setSearch(v);
    if (v && cur.view !== "advocate") setStack([{ view: "advocate" }]);
  };

  const common = { onNav: nav, onOpenPlan: openPlan, onOpenClass: openClass, onOpenAdvocate: openAdvocate, search, onSearch };

  let screen: React.ReactNode;
  switch (cur.view) {
    case "aieff":
      screen = <AIEfficiencyView {...common} />;
      break;
    case "assign":
      screen = <ClassAssignmentsView onNav={nav} search={search} onSearch={onSearch} />;
      break;
    case "trainers":
      screen = <TrainersView {...common} />;
      break;
    case "classes":
      screen = <ClassesView {...common} />;
      break;
    case "classDetail":
      screen = <ClassDetail classId={cur.classId!} onNav={nav} onBack={back} onOpenPlan={openPlan} onOpenAdvocate={openAdvocate} onGraduate={graduate} />;
      break;
    case "advocate":
      screen = <AdvocatesView {...common} />;
      break;
    case "advocateDetail":
      screen = <AdvocateDetail advId={cur.advId!} onNav={nav} onBack={back} onOpenPlan={openPlan} onOpenClass={openClass} />;
      break;
    case "coaching":
      screen = <CoachingBoard {...common} />;
      break;
    case "report":
      screen = <ReportCardsView onNav={nav} onOpenAdvocate={openAdvocate} search={search} onSearch={onSearch} />;
      break;
    case "archive":
      screen = <ArchiveView onNav={nav} search={search} onSearch={onSearch} />;
      break;
    default:
      screen = <Dashboard {...common} />;
  }

  return (
    <>
      {screen}
      <CoachingDrawer advId={planId} onClose={() => setPlanId(null)} />
      <ToastHost />
    </>
  );
}
