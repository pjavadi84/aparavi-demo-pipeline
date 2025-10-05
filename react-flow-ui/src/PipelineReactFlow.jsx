import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, { Background, Controls, MiniMap, useEdgesState, useNodesState } from "reactflow";
import "reactflow/dist/style.css";

const Pill = ({ label, tone = "idle" }) => (
  <span
    className={
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
      (tone === "ok"
        ? "bg-green-100 text-green-800"
        : tone === "warn"
        ? "bg-yellow-100 text-yellow-800"
        : tone === "err"
        ? "bg-red-100 text-red-800"
        : "bg-slate-100 text-slate-700")
    }
  >
    {label}
  </span>
);

const Panel = ({ title, children }) => (
  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-100 p-3 text-sm font-semibold text-slate-700">{title}</div>
    <div className="p-3">{children}</div>
  </div>
);

function NodeCard({ data }) {
  const { title, status, detail } = data || {};
  const tone =
    status === "done" ? "ok" : status === "running" ? "warn" : status === "error" ? "err" : "idle";
  return (
    <div className="min-w-[200px] rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-slate-800">{title}</div>
        <Pill label={status} tone={tone} />
      </div>
      {detail && <div className="mt-2 text-xs text-slate-500">{detail}</div>}
    </div>
  );
}
const nodeTypes = { default: NodeCard };

export default function PipelineReactFlow() {
  const [logs, setLogs] = useState("");
  const logRef = useRef(null);
  const append = (line) => setLogs((s) => s + (s ? "\n" : "") + line);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const initialNodes = useMemo(
    () => [
      { id: "discover", position: { x: 0, y: 0 }, data: { title: "Discover", status: "idle" }, type: "default" },
      { id: "classify", position: { x: 260, y: 0 }, data: { title: "Classify", status: "idle" }, type: "default" },
      { id: "policy", position: { x: 520, y: 0 }, data: { title: "Policy", status: "idle" }, type: "default" },
      { id: "rag", position: { x: 780, y: 0 }, data: { title: "RAG", status: "idle" }, type: "default" },
    ],
    []
  );
  const initialEdges = useMemo(
    () => [
      { id: "e1", source: "discover", target: "classify", animated: true },
      { id: "e2", source: "classify", target: "policy", animated: true },
      { id: "e3", source: "policy", target: "rag", animated: true },
    ],
    []
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const setStatus = (id, status, detail) => {
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, status, detail } } : n)));
  };

  const ensurePolicy = async () => {
    const resp = await fetch("http://localhost:8002/policies");
    const data = await resp.json();
    const list = Array.isArray(data) ? data : data.policies || [];
    const exists = list.some((p) => p.name === "QuarantineSSN");
    if (!exists) {
      await fetch("http://localhost:8002/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "QuarantineSSN", rule: { ifTag: "PII:SSN", action: "quarantine" } }),
      });
      append("✅ Policy created: QuarantineSSN");
    } else {
      append("ℹ️ Policy exists: QuarantineSSN");
    }
  };

  const run = useCallback(async () => {
    setLogs("");
    setStatus("discover", "running");
    setStatus("classify", "idle");
    setStatus("policy", "idle");
    setStatus("rag", "idle");
    try {
      await fetch("http://localhost:8001/discover", { method: "POST" });
      setStatus("discover", "done");
      append("📂 Discover complete");

      setStatus("classify", "running");
      await fetch("http://localhost:8001/classify", { method: "POST" });
      setStatus("classify", "done");
      append("🔍 Classification complete");

      setStatus("policy", "running");
      await ensurePolicy();
      const appRes = await fetch("http://localhost:8002/apply", { method: "POST" });
      const appJson = await appRes.json();
      setStatus("policy", "done", `${(appJson.applied || []).length} action(s)`);
      append("⚙️ Apply result: " + JSON.stringify(appJson));

      setStatus("rag", "running");
      const idx = await (await fetch("http://localhost:8001/index")).json();
      const docs = Object.values(idx.index || {});
      if (!docs.length) {
        setStatus("rag", "done", "0 docs");
        append("⚠️ No documents remain after policy actions");
        return;
      }
      const rag = await (
        await fetch("http://localhost:8003/rag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: "Summarize contracts and invoices with any PII mentions",
            docs,
            k: 3,
          }),
        })
      ).json();
      setStatus("rag", "done", "answer ready");
      append("🤖 RAG answer:\n" + rag.answer);
    } catch (e) {
      append("❌ Pipeline error: " + (e?.message || e));
      setNodes((nds) =>
        nds.map((n) => (n.data.status === "running" ? { ...n, data: { ...n.data, status: "error" } } : n))
      );
    }
  }, [setNodes]);

  return (
    <div className="h-[100vh] w-full bg-slate-50">
      <div className="mx-auto max-w-[1100px] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Aparavi-Style Pipeline (React + React Flow)</h1>
          <button
            onClick={run}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
          >
            Run Pipeline
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <div style={{ height: 420 }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
              >
                <MiniMap />
                <Controls />
                <Background gap={16} />
              </ReactFlow>
            </div>
          </div>
          <div className="md:col-span-1">
            <Panel title="Run Logs">
              <pre ref={logRef} className="max-h-[380px] whitespace-pre-wrap text-xs leading-relaxed">
                {logs || "Click 'Run Pipeline' to start..."}
              </pre>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
