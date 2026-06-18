import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import { useParams } from "react-router-dom";
import GlobalLayout from "../../Layouts/GlobalLayout";

// ---------- Utilities ----------
let _id = 1;
const nextId = (p = "node") => `${p}_${_id++}`;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

const nodeCommon = {
  style: {
    borderRadius: 14,
    border: "1px solid #E5E7EB",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    padding: 8,
    background: "#fff",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
    fontSize: 13,
  },
};

const paletteItems = [
  { type: "start", label: "Start" },
  { type: "wa_template", label: "WA Template" },
  { type: "wa_buttons", label: "WA Buttons" },
  { type: "wa_list", label: "WA List" },
  { type: "wa_media", label: "WA Media" },
  { type: "message", label: "Text Msg" },
  { type: "input", label: "Input (free)" },
  { type: "condition", label: "Condition" },
  { type: "api", label: "API" },
  { type: "delay", label: "Delay" },
  { type: "end_session", label: "End Session" },
  { type: "end", label: "End Flow" },
  { type: "form", label: "Form" },
];

// ---------- Tiny UI helpers ----------
const Pill = ({ text }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 border text-gray-700 text-[11px]">
    {text}
  </span>
);

function Header1({ title, accent = "#111827" }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <div
        style={{ width: 8, height: 8, borderRadius: 999, background: accent }}
      />
      <div className="text-[12px] font-semibold text-gray-800">{title}</div>
    </div>
  );
}

// ---------- Node components ----------
const StartNode = () => (
  <div {...nodeCommon} className="min-w-[160px]">
    <Header1 title="Start" accent="#10B981" />
    <div className="text-xs text-gray-600">Entry point</div>
    <Handle type="source" position={Position.Bottom} id="out" />
  </div>
);

const EndNode = () => (
  <div {...nodeCommon} className="min-w-[160px]">
    <Header1 title="End Flow" accent="#EF4444" />
    <div className="text-xs text-gray-600">Stops the flow</div>
    <Handle type="target" position={Position.Top} id="in" />
  </div>
);

const EndSessionNode = () => (
  <div {...nodeCommon} className="min-w-[180px]">
    <Header1 title="End WA Session" accent="#DC2626" />
    <div className="text-xs text-gray-600">Marks end of 24‑hr window</div>
    <Handle type="target" position={Position.Top} id="in" />
    <Handle type="source" position={Position.Bottom} id="out" />
  </div>
);

const MessageNode = ({ data }) => (
  <div {...nodeCommon} className="min-w-[240px]">
    <Header1 title="Text Message" accent="#3B82F6" />
    <div className="text-[12px] whitespace-pre-wrap text-gray-800">
      {data.text || "Your message..."}
    </div>
    <div className="text-[11px] text-gray-500 mt-1">≤ 4096 chars</div>
    <Handle type="target" position={Position.Top} id="in" />
    <Handle type="source" position={Position.Bottom} id="out" />
  </div>
);
const FormNode = ({ data }) => (
  <div {...nodeCommon} className="min-w-[280px]">
    <Header1 title="Form" accent="#7C3AED" />

    <div className="text-[12px] text-gray-700 mb-2">
      {data.title || "User Form"}
    </div>

    {(data.fields || []).map((field, index) => (
      <div
        key={index}
        className="text-[11px] border rounded px-2 py-1 mb-1 bg-gray-50"
      >
        {field.label}
      </div>
    ))}

    <div className="text-[11px] text-gray-500">
      Submit Button
    </div>

    <Handle type="target" position={Position.Top} id="in" />
    <Handle type="source" position={Position.Bottom} id="out" />
  </div>
);
const WAButtonsNode = ({ data }) => {
  const options = (data.options || []).slice(0, 3);
  return (
    <div {...nodeCommon} className="min-w-[260px]">
      <Header1 title="WA Quick Replies (≤3)" accent="#0EA5E9" />
      <div className="text-[12px] text-gray-800 mb-2">
        {data.prompt || "Choose one:"}
      </div>
      <div className="flex flex-wrap gap-1 mb-1">
        {options.map((o, i) => (
          <Pill key={o.id} text={(o.title || `Option ${i + 1}`).slice(0, 20)} />
        ))}
      </div>
      <div className="text-[11px] text-gray-500">Each title ≤ 20 chars</div>
      <Handle type="target" position={Position.Top} id="in" />
      <div className="relative h-3" />
      <div className="flex justify-between">
        {options.map((o, i) => (
          <div key={o.id} className="relative">
            <Handle type="source" position={Position.Bottom} id={o.id} />
            <div className="text-[10px] text-gray-400 absolute -bottom-4 -translate-x-1/2 left-1/2">
              {i + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WAListNode = ({ data }) => {
  const sections = data.sections?.length
    ? data.sections
    : [
        {
          title: "Options",
          rows: [
            { id: "r1", title: "Item 1" },
            { id: "r2", title: "Item 2" },
          ],
        },
      ];
  return (
    <div {...nodeCommon} className="min-w-[300px]">
      <Header1 title="WA List Message" accent="#22C55E" />
      <div className="text-[12px] text-gray-800">
        {data.body || "Pick from a list"}
      </div>
      <div className="text-[11px] text-gray-500 mb-1">
        Button text: {data.buttonText || "View options"}
      </div>
      <div className="text-[11px] text-gray-500">≤ 10 rows per section</div>
      <Handle type="target" position={Position.Top} id="in" />
      <div className="mt-1" />
      {sections.map((s, si) => (
        <div
          key={si}
          className="text-[11px] bg-gray-50 border rounded p-2 mb-1"
        >
          <div className="font-semibold">{s.title}</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {s.rows.slice(0, 10).map((r) => (
              <Pill key={r.id} text={r.title.slice(0, 24)} />
            ))}
          </div>
        </div>
      ))}
      <div className="flex justify-center mt-1">
        <Handle type="source" position={Position.Bottom} id="on_select" />
      </div>
    </div>
  );
};

const WAMediaNode = ({ data }) => (
  <div {...nodeCommon} className="min-w-[280px]">
    <Header1 title="WA Media" accent="#F59E0B" />
    <div className="text-[12px] text-gray-800">
      {(data.mediaType || "image").toUpperCase()} → {data.url || "https://..."}
    </div>
    <div className="text-[11px] text-gray-500">
      Supports image/video/document/audio/sticker
    </div>
    <Handle type="target" position={Position.Top} id="in" />
    <Handle type="source" position={Position.Bottom} id="out" />
  </div>
);

const WATemplateNode = ({ data }) => (
  <div {...nodeCommon} className="min-w-[320px]">
    <Header1 title="WA Template (HSM)" accent="#8B5CF6" />
    <div className="text-[12px] text-gray-800">
      {data.name || "template_name"} • {data.language || "en_US"}
    </div>
    <div className="text-[11px] text-gray-500">
      Header: {data.headerType || "none"} • Body vars:{" "}
      {(data.bodyParams || []).length}
    </div>
    <div className="text-[11px] text-gray-500">
      Buttons: {(data.buttons || []).length}
    </div>
    <Handle type="target" position={Position.Top} id="in" />
    <Handle type="source" position={Position.Bottom} id="out" />
  </div>
);

const InputNode = ({ data }) => (
  <div {...nodeCommon} className="min-w-[240px]">
    <Header1 title="Free Text Input" accent="#14B8A6" />
    <div className="text-[12px] text-gray-800">
      {data.prompt || "Ask for user input"}
    </div>
    <div className="text-[11px] text-gray-500 mt-1">
      Save to: <span className="font-mono">{data.varName || "varName"}</span>
    </div>
    <Handle type="target" position={Position.Top} id="in" />
    <Handle type="source" position={Position.Bottom} id="out" />
  </div>
);

const DelayNode = ({ data }) => (
  <div {...nodeCommon} className="min-w-[180px]">
    <Header1 title="Delay" accent="#9CA3AF" />
    <div className="text-[12px] text-gray-800">{data.ms ?? 1000} ms</div>
    <Handle type="target" position={Position.Top} id="in" />
    <Handle type="source" position={Position.Bottom} id="out" />
  </div>
);

const ConditionNode = ({ data }) => (
  <div {...nodeCommon} className="min-w-[260px]">
    <Header1 title="Condition" accent="#EC4899" />
    <div className="text-[11px] text-gray-700 font-mono bg-gray-50 border p-1 rounded">
      {data.expression || "ctx.score > 10"}
    </div>
    <div className="text-[11px] text-gray-500 mt-1">
      True → first edge, False → second edge
    </div>
    <Handle type="target" position={Position.Top} id="in" />
    <div className="flex gap-8 justify-center mt-1">
      <div className="relative">
        <Handle type="source" position={Position.Bottom} id="true" />
        <div className="text-[10px] text-green-600 absolute -bottom-4 left-1/2 -translate-x-1/2">
          true
        </div>
      </div>
      <div className="relative">
        <Handle type="source" position={Position.Bottom} id="false" />
        <div className="text-[10px] text-rose-600 absolute -bottom-4 left-1/2 -translate-x-1/2">
          false
        </div>
      </div>
    </div>
  </div>
);

const APINode = ({ data }) => (
  <div {...nodeCommon} className="min-w-[300px]">
    <Header1 title="HTTP Request" accent="#0EA5E9" />
    <div className="text-[12px] text-gray-800">
      {(data.method || "GET").toUpperCase()} {data.url || "/api"}
    </div>
    {data.saveAs && (
      <div className="text-[11px] text-gray-500">
        Save response → <span className="font-mono">ctx.{data.saveAs}</span>
      </div>
    )}
    <Handle type="target" position={Position.Top} id="in" />
    <Handle type="source" position={Position.Bottom} id="out" />
  </div>
);

const nodeTypes = {
  start: StartNode,
  end: EndNode,
  end_session: EndSessionNode,
  message: MessageNode,
  wa_buttons: WAButtonsNode,
  wa_list: WAListNode,
  wa_media: WAMediaNode,
  wa_template: WATemplateNode,
  input: InputNode,
  delay: DelayNode,
  condition: ConditionNode,
  api: APINode,
  form: FormNode,
};

// ---------- Create node factories ----------
function cryptoRandom(len = 8) {
  const arr = new Uint8Array(len);
  (typeof crypto !== "undefined" ? crypto : window.crypto).getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

function createNode(type, position) {
  const base = { id: nextId(type), type, position, data: {} };
  switch (type) {
    case "start":
      return { ...base };
    case "end":
      return { ...base };
    case "end_session":
      return { ...base };
    case "message":
      return { ...base, data: { text: "Hi there! 👋" } };
    case "wa_buttons":
      return {
        ...base,
        data: {
          prompt: "Choose one:",
          options: [
            { id: `btn_${cryptoRandom(4)}`, title: "Yes" },
            { id: `btn_${cryptoRandom(4)}`, title: "No" },
          ],
        },
      };
    case "wa_list":
      return {
        ...base,
        data: {
          body: "Please pick an option",
          buttonText: "View options",
          sections: [
            {
              title: "Menu",
              rows: [
                { id: `row_${cryptoRandom(3)}`, title: "Option A" },
                { id: `row_${cryptoRandom(3)}`, title: "Option B" },
              ],
            },
          ],
        },
      };
      case "form":
  return {
    ...base,
    data: {
      title: "Signup Form",
      fields: [
        {
          id: "name",
          label: "Name",
          type: "text",
          required: true,
        },
        {
          id: "email",
          label: "Email",
          type: "email",
          required: true,
        },
      ],
    },
  };
    case "wa_media":
      return {
        ...base,
        data: {
          mediaType: "image",
          url: "https://example.com/image.jpg",
          caption: "",
        },
      };
    case "wa_template":
      return {
        ...base,
        data: {
          name: "greeting_template",
          language: "en_US",
          headerType: "none",
          bodyParams: ["first_name"],
          buttons: [],
        },
      };
    case "input":
      return { ...base, data: { prompt: "Your answer?", varName: "answer" } };
    case "delay":
      return { ...base, data: { ms: 1000 } };
    case "condition":
      return { ...base, data: { expression: "ctx.answer === 'Yes'" } };
    case "api":
      return {
        ...base,
        data: {
          method: "POST",
          url: "/api/score",
          bodyTemplate: '{"answer":"{{answer}}"}',
          saveAs: "api",
        },
      };
    default:
      return base;
  }
}

function download(filename, text) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------- Validation (WhatsApp constraints) ----------
function validateFlow(nodes, edges) {
  const warnings = [];
  const startNodes = nodes.filter((n) => n.type === "start");
  if (startNodes.length !== 1)
    warnings.push(
      `Flow should have exactly one Start node (found ${startNodes.length}).`
    );

  // Reachability
  const startId = startNodes[0]?.id;
  if (startId) {
    const adj = new Map();
    for (const e of edges) {
      if (!adj.has(e.source)) adj.set(e.source, []);
      adj.get(e.source).push(e.target);
    }
    const seen = new Set([startId]);
    const q = [startId];
    while (q.length) {
      const v = q.shift();
      for (const w of adj.get(v) || [])
        if (!seen.has(w)) {
          seen.add(w);
          q.push(w);
        }
    }
    const unreachable = nodes.filter((n) => !seen.has(n.id));
    if (unreachable.length)
      warnings.push(
        `Unreachable nodes: ${unreachable
          .map((n) => `${n.type}(${n.id})`)
          .join(", ")}`
      );
  }

  // WA specific
  for (const n of nodes) {
    if (n.type === "wa_buttons") {
      const opts = n.data?.options || [];
      if (opts.length === 0 || opts.length > 3)
        warnings.push(`WA Buttons ${n.id} must have 1–3 options.`);
      for (const o of opts) {
        if ((o.title || "").length > 20)
          warnings.push(`Button title too long in ${n.id}: "${o.title}"`);
        const has = edges.some(
          (e) => e.source === n.id && e.sourceHandle === o.id
        );
        if (!has)
          warnings.push(
            `Buttons ${n.id} option "${o.title}" is not connected.`
          );
      }
    }
    if (n.type === "wa_list") {
      const btn = n.data?.buttonText || "";
      if (!btn || btn.length > 20)
        warnings.push(`WA List ${n.id} button text required (≤20 chars).`);
      for (const s of n.data?.sections || [])
        if ((s.rows || []).length > 10)
          warnings.push(`WA List section "${s.title}" exceeds 10 rows.`);
    }
    if (n.type === "wa_template") {
      if (!n.data?.name) warnings.push(`Template ${n.id} needs a name.`);
      const buttons = n.data?.buttons || [];
      if (buttons.length > 3) warnings.push(`Template ${n.id} max 3 buttons.`);
    }
  }

  return warnings;
}


const Field = ({ label, children }) => (
  <label className="block mb-3">
    <div className="text-[11px] text-gray-500 mb-1">{label}</div>
    {children}
  </label>
);

const Textarea = ({ value, onChange, rows = 3, placeholder, onBlur }) => (
  <textarea
    className="w-full border rounded-lg p-2 text-[12px] focus:outline-none focus:ring"
    value={value || ""}
    placeholder={placeholder}
    rows={rows}
    onChange={(e) => onChange(e.target.value)}
    onBlur={onBlur}
  />
);

const Input = ({ value, onChange, placeholder, type = "text", onBlur }) => (
  <input
    type={type}
    className="w-full border rounded-lg p-2 text-[12px] focus:outline-none focus:ring"
    value={value || ""}
    placeholder={placeholder}
    onChange={(e) => onChange(e.target.value)}
    onBlur={onBlur}
  />
);

const NumberInput = ({ value, onChange, onBlur }) => (
  <input
    type="number"
    className="w-full border rounded-lg p-2 text-[12px] focus:outline-none focus:ring"
    value={value || 0}
    onChange={(e) => onChange(parseInt(e.target.value || "0", 10))}
    onBlur={onBlur}
  />
);

function Inspector({ node, setNodes, edges, setEdges }) {
  const [localData, setLocalData] = React.useState(node?.data);

  // reset when node changes
  React.useEffect(() => {
    setLocalData(node?.data);
  }, [node?.id]);

  const commit = React.useCallback(() => {
    setNodes((nds) =>
      nds.map((n) => (n.id === node?.id ? { ...n, data: { ...localData } } : n))
    );
  }, [node?.id, localData, setNodes]);

  if (!node)
    return (
      <div className="h-full overflow-y-auto p-3 text-xs text-gray-500">
        Select a node to edit its properties.
      </div>
    );

  return (
    <div className="h-full overflow-y-auto p-3 text-[12px]">
      <div className="text-[12px] font-semibold mb-2">
        {node.type.toUpperCase()} • {node.id}
      </div>

      {node.type === "message" && (
        <Field label="Message text (≤4096)">
          <Textarea
            value={localData?.text || ""}
            rows={5}
            onChange={(v) =>
              setLocalData((d) => ({ ...d, text: v.slice(0, 4096) }))
            }
            onBlur={commit}
          />
        </Field>
      )}

      {node.type === "wa_buttons" && (
        <>
          <Field label="Prompt">
            <Input
              value={localData?.prompt || ""}
              onChange={(v) => setLocalData((d) => ({ ...d, prompt: v }))}
              onBlur={commit}
            />
          </Field>
          <div className="text-[11px] font-semibold mb-1">Buttons (1–3)</div>
          {(localData?.options || []).map((o, idx) => (
            <div key={o.id} className="flex items-center gap-2 mb-2">
              <Input
                value={o.title}
                onChange={(v) => {
                  const newOptions = [...(localData.options || [])];
                  newOptions[idx] = {
                    ...newOptions[idx],
                    title: v.slice(0, 20),
                  };
                  setLocalData((d) => ({
                    ...d,
                    options: newOptions.slice(0, 3),
                  }));
                }}
                onBlur={commit}
              />
              <button
                className="px-2 py-1 border rounded"
                onClick={() => {
                  const newOptions = [...(localData.options || [])];
                  newOptions.splice(idx, 1);
                  setLocalData((d) => ({ ...d, options: newOptions }));
                  setEdges((eds) =>
                    eds.filter(
                      (e) => !(e.source === node.id && e.sourceHandle === o.id)
                    )
                  );
                  commit();
                }}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            className="text-xs px-2 py-1 border rounded"
            onClick={() => {
              const newOptions = [
                ...(localData.options || []).slice(0, 2),
                {
                  id: `btn_${Math.random().toString(36).substr(2, 4)}`,
                  title: `Option ${(localData.options?.length || 0) + 1}`,
                },
              ];
              setLocalData((d) => ({ ...d, options: newOptions }));
              commit();
            }}
          >
            + Add button
          </button>
        </>
      )}
      {node.type === "form" && (
  <>
    <Field label="Form Title">
      <Input
        value={localData?.title || ""}
        onChange={(v) =>
          setLocalData((d) => ({ ...d, title: v }))
        }
        onBlur={commit}
      />
    </Field>

    <div className="text-[11px] font-semibold mb-2">
      Fields
    </div>

    {(localData?.fields || []).map((field, index) => (
      <div key={index} className="border rounded p-2 mb-2">
        <Input
          value={field.label}
          placeholder="Field Label"
          onChange={(v) => {
            const fields = [...localData.fields];
            fields[index].label = v;

            setLocalData((d) => ({
              ...d,
              fields,
            }));
          }}
          onBlur={commit}
        />

        <select
          className="w-full border rounded p-2 mt-2"
          value={field.type}
          onBlur={commit}
          onChange={(e) => {
            const fields = [...localData.fields];
            fields[index].type = e.target.value;

            setLocalData((d) => ({
              ...d,
              fields,
            }));
          }}
        >
          <option value="text">Text</option>
          <option value="email">Email</option>
          <option value="number">Number</option>
          <option value="phone">Phone</option>
          <option value="date">Date</option>
        </select>
        
        <button
          className="mt-2 px-2 py-1 border rounded text-xs"
          onClick={() => {
            const fields = [...localData.fields];
            fields.splice(index, 1);
            
            const newData = {
              ...localData,
              fields,
            };
            
            setLocalData(newData);
            
            setNodes((nds) =>
              nds.map((n) =>
                n.id === node.id
                  ? { ...n, data: newData }
                  : n
              )
            );
          }}
        >
          Remove Field
        </button>
      </div>
    ))}

    <button
      className="text-xs px-2 py-1 border rounded"
      onClick={() => {
        const fields = [
          ...(localData.fields || []),
          {
            id: `field_${Date.now()}`,
            label: "New Field",
            type: "text",
          },
        ];

        const newData = {
          ...localData,
          fields,
        };

        setLocalData(newData);

        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? { ...n, data: newData }
              : n
          )
        );
      }}
    >
      + Add Field
    </button>
  </>
)}
      {node.type === "wa_list" && (
        <>
          <Field label="Body">
            <Textarea
              value={localData?.body || ""}
              onChange={(v) =>
                setLocalData((d) => ({ ...d, body: v.slice(0, 1024) }))
              }
              rows={3}
              onBlur={commit}
            />
          </Field>
          <Field label="Button text (≤20)">
            <Input
              value={localData?.buttonText || ""}
              onChange={(v) =>
                setLocalData((d) => ({ ...d, buttonText: v.slice(0, 20) }))
              }
              onBlur={commit}
            />
          </Field>
          <div className="text-[11px] font-semibold mb-1">Sections</div>
          {(localData?.sections || []).map((s, si) => (
            <div key={si} className="border rounded p-2 mb-2 bg-gray-50">
              <Input
                value={s.title}
                onChange={(v) => {
                  const newSections = [...(localData.sections || [])];
                  newSections[si] = { ...newSections[si], title: v };
                  setLocalData((d) => ({ ...d, sections: newSections }));
                }}
                onBlur={commit}
              />
              {(s.rows || []).slice(0, 10).map((r, ri) => (
                <div key={r.id} className="flex items-center gap-2 mt-1">
                  <Input
                    value={r.title}
                    onChange={(v) => {
                      const newSections = [...(localData.sections || [])];
                      const newRows = [...newSections[si].rows];
                      newRows[ri] = {
                        ...newRows[ri],
                        title: v.slice(0, 24),
                      };
                      newSections[si] = { ...newSections[si], rows: newRows };
                      setLocalData((d) => ({ ...d, sections: newSections }));
                    }}
                    onBlur={commit}
                  />
                  <button
                    className="px-2 py-1 border rounded"
                    onClick={() => {
                      const newSections = [...(localData.sections || [])];
                      const newRows = [...newSections[si].rows];
                      newRows.splice(ri, 1);
                      newSections[si] = { ...newSections[si], rows: newRows };
                      setLocalData((d) => ({ ...d, sections: newSections }));
                      commit();
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                className="mt-2 text-xs px-2 py-1 border rounded"
                onClick={() => {
                  const newSections = [...(localData.sections || [])];
                  const newRows = [...(newSections[si].rows || [])];
                  if (newRows.length < 10) {
                    newRows.push({
                      id: `row_${Math.random().toString(36).substr(2, 3)}`,
                      title: `Item ${newRows.length + 1}`,
                    });
                  }
                  newSections[si] = { ...newSections[si], rows: newRows };
                  setLocalData((d) => ({ ...d, sections: newSections }));
                  commit();
                }}
              >
                + Add row
              </button>
            </div>
          ))}
          <button
            className="text-xs px-2 py-1 border rounded"
            onClick={() => {
              const newSections = [
                ...(localData.sections || []),
                {
                  title: `Section ${(localData.sections?.length || 0) + 1}`,
                  rows: [],
                },
              ];
              setLocalData((d) => ({ ...d, sections: newSections }));
              commit();
            }}
          >
            + Add section
          </button>
        </>
      )}

      {node.type === "wa_media" && (
        <>
          <Field label="Media type">
            <select
              className="w-full border rounded p-2"
              value={localData?.mediaType || "image"}
              onChange={(e) =>
                setLocalData((d) => ({ ...d, mediaType: e.target.value }))
              }
              onBlur={commit}
            >
              <option>image</option>
              <option>video</option>
              <option>document</option>
              <option>audio</option>
              <option>sticker</option>
            </select>
          </Field>
          <Field label="URL">
            <Input
              value={localData?.url || ""}
              onChange={(v) => setLocalData((d) => ({ ...d, url: v }))}
              onBlur={commit}
            />
          </Field>
          <Field label="Caption (optional)">
            <Input
              value={localData?.caption || ""}
              onChange={(v) =>
                setLocalData((d) => ({ ...d, caption: v.slice(0, 1024) }))
              }
              onBlur={commit}
            />
          </Field>
        </>
      )}

      {node.type === "wa_template" && (
        <>
          <Field label="Template name">
            <Input
              value={localData?.name || ""}
              onChange={(v) => setLocalData((d) => ({ ...d, name: v }))}
              onBlur={commit}
            />
          </Field>
          <Field label="Language">
            <Input
              value={localData?.language || "en_US"}
              onChange={(v) => setLocalData((d) => ({ ...d, language: v }))}
              onBlur={commit}
            />
          </Field>
          <Field label="Header type">
            <select
              className="w-full border rounded p-2"
              value={localData?.headerType || "none"}
              onChange={(e) =>
                setLocalData((d) => ({ ...d, headerType: e.target.value }))
              }
              onBlur={commit}
            >
              <option>none</option>
              <option>text</option>
              <option>image</option>
              <option>video</option>
              <option>document</option>
            </select>
          </Field>
          <Field label="Body variables (comma‑separated)">
            <Input
              value={(localData?.bodyParams || []).join(", ")}
              onChange={(v) =>
                setLocalData((d) => ({
                  ...d,
                  bodyParams: v
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean),
                }))
              }
              onBlur={commit}
            />
          </Field>
          <div className="text-[11px] font-semibold mb-1">
            Buttons (max 3, quick_reply / url)
          </div>
          {(localData?.buttons || []).map((b, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 mb-2">
              <select
                className="border rounded p-1"
                value={b.type}
                onChange={(e) => {
                  const newButtons = [...(localData.buttons || [])];
                  newButtons[i] = { ...newButtons[i], type: e.target.value };
                  setLocalData((d) => ({
                    ...d,
                    buttons: newButtons.slice(0, 3),
                  }));
                }}
                onBlur={commit}
              >
                <option value="quick_reply">quick_reply</option>
                <option value="url">url</option>
              </select>
              <Input
                placeholder="title"
                value={b.text || ""}
                onChange={(v) => {
                  const newButtons = [...(localData.buttons || [])];
                  newButtons[i] = { ...newButtons[i], text: v.slice(0, 20) };
                  setLocalData((d) => ({ ...d, buttons: newButtons }));
                }}
                onBlur={commit}
              />
              <Input
                placeholder="url (if type=url)"
                value={b.url || ""}
                onChange={(v) => {
                  const newButtons = [...(localData.buttons || [])];
                  newButtons[i] = { ...newButtons[i], url: v };
                  setLocalData((d) => ({ ...d, buttons: newButtons }));
                }}
                onBlur={commit}
              />
              <button
                className="col-span-3 text-xs px-2 py-1 border rounded"
                onClick={() => {
                  const newButtons = [...(localData.buttons || [])];
                  newButtons.splice(i, 1);
                  setLocalData((d) => ({ ...d, buttons: newButtons }));
                  commit();
                }}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            className="text-xs px-2 py-1 border rounded"
            onClick={() => {
              const newButtons = [
                ...(localData.buttons || []).slice(0, 2),
                { type: "quick_reply", text: "OK" },
              ];
              setLocalData((d) => ({ ...d, buttons: newButtons }));
              commit();
            }}
          >
            + Add button
          </button>
        </>
      )}

      {node.type === "input" && (
        <>
          <Field label="Prompt">
            <Input
              value={localData?.prompt || ""}
              onChange={(v) => setLocalData((d) => ({ ...d, prompt: v }))}
              onBlur={commit}
            />
          </Field>
          <Field label="Variable name (ctx)">
            <Input
              value={localData?.varName || ""}
              onChange={(v) => setLocalData((d) => ({ ...d, varName: v }))}
              onBlur={commit}
            />
          </Field>
        </>
      )}

      {node.type === "delay" && (
        <Field label="Milliseconds">
          <NumberInput
            value={localData?.ms ?? 1000}
            onChange={(v) => setLocalData((d) => ({ ...d, ms: v }))}
            onBlur={commit}
          />
        </Field>
      )}

      {node.type === "condition" && (
  <Field label="JS Expression (use ctx)">
    <Input
      value={localData?.expression || ""}
      onChange={(v) => setLocalData(d => ({ ...d, expression: v }))}
      onBlur={commit}
    />
  </Field>
      )}

      {node.type === "api" && (
        <>
          <Field label="Method">
            <select
              className="w-full border rounded p-2"
              value={(localData?.method || "GET").toUpperCase()}
              onChange={(e) => setLocalData(d => ({ ...d, method: e.target.value }))}
              onBlur={commit}
            >
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>PATCH</option>
              <option>DELETE</option>
            </select>
          </Field>
          <Field label="URL">
            <Input
              value={localData?.url || ""}
              onChange={(v) => setLocalData(d => ({ ...d, url: v }))}
              onBlur={commit}
            />
          </Field>
          <Field label="Body Template (JSON, supports {{var}})">
            <Textarea
              rows={4}
              value={localData?.bodyTemplate || ""}
              onChange={(v) => setLocalData(d => ({ ...d, bodyTemplate: v }))}
              onBlur={commit}
            />
          </Field>
          <Field label="Save response to ctx as">
            <Input
              value={localData?.saveAs || ""}
              onChange={(v) => setLocalData(d => ({ ...d, saveAs: v }))}
              onBlur={commit}
            />
          </Field>
        </>
      )}

      {(node.type === "start" ||
        node.type === "end" ||
        node.type === "end_session") && (
        <div className="text-[11px] text-gray-600">No settings.</div>
      )}

      
    </div>
  );
}

// ---------- Exporters ----------
function interpolate(str, ctx) {
  return (str || "").replace(/{{(.*?)}}/g, (_, k) => ctx[k.trim()] ?? "");
}

function exportToMetaMessages(nodes, edges) {
  // Simple linear traversal for demo (first outgoing edge). For branches, include edge labels in your runtime.
  const start = nodes.find((n) => n.type === "start");
  if (!start) return { messages: [], schema: {} };
  const adj = new Map();
  for (const e of edges) {
    if (!adj.has(e.source)) adj.set(e.source, []);
    adj.get(e.source).push(e);
  }
  const ordered = [];
  let cur = start.id;
  const seen = new Set();
  let guard = 0;
  while (cur && guard++ < 999) {
    const node = nodes.find((n) => n.id === cur);
    if (!node) break;
    if (seen.has(cur) && node.type !== "end_session") break;
    seen.add(cur);
    ordered.push(node);
    const e = (adj.get(cur) || [])[0];
    cur = e?.target;
  }

  const messages = [];
  for (const n of ordered) {
    if (n.type === "message")
      messages.push({ type: "text", text: { body: n.data.text || "" } });
    if (n.type === "wa_buttons")
      messages.push({
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: n.data.prompt || "" },
          action: {
            buttons: (n.data.options || []).slice(0, 3).map((o) => ({
              type: "reply",
              reply: { id: o.id, title: (o.title || "").slice(0, 20) },
            })),
          },
        },
      });
      if (n.type === "form")
  messages.push({
    type: "form",
    title: n.data.title,
    fields: n.data.fields || [],
  });
    if (n.type === "wa_list")
      messages.push({
        type: "interactive",
        interactive: {
          type: "list",
          body: { text: n.data.body || "" },
          action: {
            button: n.data.buttonText || "View",
            sections: (n.data.sections || []).map((s) => ({
              title: s.title,
              rows: (s.rows || [])
                .slice(0, 10)
                .map((r) => ({ id: r.id, title: r.title })),
            })),
          },
        },
      });
    if (n.type === "wa_media")
      messages.push({
        type: n.data.mediaType || "image",
        [n.data.mediaType || "image"]: {
          link: n.data.url,
          caption: n.data.caption,
        },
      });
    if (n.type === "wa_template")
      messages.push({
        type: "template",
        template: {
          name: n.data.name,
          language: { code: n.data.language || "en_US" },
          components: [
            ...(n.data.headerType && n.data.headerType !== "none"
              ? [{ type: "header", format: n.data.headerType.toUpperCase() }]
              : []),
            {
              type: "body",
              parameters: (n.data.bodyParams || []).map((p) => ({
                type: "text",
                text: `{{${p}}}`,
              })),
            },
            ...((n.data.buttons || []).length
              ? [{ type: "button", sub_type: "quick_reply", index: 0 }]
              : []),
          ],
        },
      });
    if (n.type === "end_session")
      messages.push({ type: "text", text: { body: "[Session Ended]" } });
  }

  const schema = {
    nodes: nodes.map((n) => ({ id: n.id, type: n.type, data: n.data })),
    edges,
  };
  return { messages, schema };
}

// ==================== INTEGRATED PREVIEW MODAL (FROM FIRST FILE) ====================
function PreviewModal({ isOpen, onClose, nodes, edges }) {
  
    // const [messages, setMessages] = useState([]);
// const [currentNode, setCurrentNode] = useState(null);
// const [variables, setVariables] = useState({});
const [selectedButtons, setSelectedButtons] = useState({});
    const [messages, setMessages] = useState([]);
    const [currentNode, setCurrentNode] = useState(null);
    const [variables, setVariables] = useState({});
    const [inputValue, setInputValue] = useState("");
    const [activeList, setActiveList] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDelaying, setIsDelaying] = useState(false);
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    // Helper: get nested value from object
    const getNestedValue = (obj, path) => {
        return path.split(".").reduce((acc, key) => acc?.[key], obj);
    };

    // Replace variables in text
    const replaceVariables = (text) => {
        if (!text) return "";
        return text.replace(/\{\{(.*?)\}\}/g, (_, variable) => {
            const value = getNestedValue(variables, variable.trim());
            return value ?? "";
        });
    };

    // Move to next node based on sourceHandle
    const moveToNextNode = (fromNode, sourceHandle = null) => {
        const edge = edges.find((e) => {
            if (e.source !== fromNode.id) return false;
            if (sourceHandle !== null) return e.sourceHandle === sourceHandle;
            return true;
        });
        if (!edge) return;
        executeNode(edge.target);
    };

    // Execute a node by ID
    const executeNode = (nodeId) => {
        const nextNode = nodes.find((node) => node.id === nodeId);
        if (!nextNode) return;
        setTimeout(() => {
            const hiddenTypes = [
  "condition",
  "delay",
  "api"
];

if (!hiddenTypes.includes(nextNode.type)) {
  setMessages(prev => [
    ...prev,
    { type: "bot", node: nextNode }
  ]);
}
            setCurrentNode(nextNode);
        }, 500);
    };

    // Execute delay node
    const executeDelay = (delayNode) => {
        setIsDelaying(true);
        const ms = delayNode.data.ms || 1000;
        setTimeout(() => {
            setIsDelaying(false);
            moveToNextNode(delayNode);
        }, Math.min(ms, 5000));
    };

    // Execute API call
    const executeApiCall = async (apiNode) => {
        setIsLoading(true);
        const {
            method = "GET",
            url = "",
            bodyTemplate = "",
            saveAs = "apiResponse",
        } = apiNode.data;

        try {
            const processedUrl = replaceVariables(url);
            let processedBody = null;
            if (method !== "GET" && bodyTemplate) {
                const replaced = replaceVariables(bodyTemplate);
                try {
                    processedBody = JSON.parse(replaced);
                } catch {
                    processedBody = replaced;
                }
            }

            const fetchHeaders = { "Content-Type": "application/json" };
            const fetchOptions = { method, headers: fetchHeaders };
            if (processedBody !== null) {
                fetchOptions.body = JSON.stringify(processedBody);
            }

            const response = await fetch(processedUrl, fetchOptions);
            let responseData;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            if (saveAs) {
                setVariables((prev) => ({ ...prev, [saveAs]: responseData }));
            }
            moveToNextNode(apiNode, "success");
        } catch (error) {
            console.error("API ERROR:", error);
            moveToNextNode(apiNode, "error");
        } finally {
            setIsLoading(false);
        }
    };

    // Execute condition using expression
    const evaluateCondition = (conditionNode) => {
        const expression = conditionNode.data.expression || "true";
        let result = false;
        try {
            const ctx = variables;
            result = !!Function("ctx", `return (${expression})`)(ctx);
        } catch (err) {
            console.error("Condition evaluation error:", err);
            result = false;
        }

        const targetEdge = edges.find(
            (e) => e.source === conditionNode.id && e.sourceHandle === (result ? "true" : "false")
        );
        if (!targetEdge) return;
        executeNode(targetEdge.target);
    };

    // Execute end session
    const executeEndSession = (endNode) => {
        setMessages((prev) => [
            ...prev,
            { type: "bot", text: endNode.data.message || "Thank You!" },
        ]);
        setCurrentNode(null);
        setTimeout(() => {
            setVariables({});
            const startNode = nodes.find((node) => node.type === "start");
            if (startNode) {
                const startEdge = edges.find((edge) => edge.source === startNode.id);
                if (startEdge) {
                    executeNode(startEdge.target);
                }
            }
        }, 2500);
    };

    // Handle button click for wa_buttons
const handleButtonClick = (buttonTitle, buttonId) => {

    setSelectedButtons(prev => ({
        ...prev,
        [currentNode.id]: buttonTitle
    }));

    setMessages(prev => [
        ...prev,
        {
            type: "user",
            text: buttonTitle
        }
    ]);

    const edge = edges.find(
        e =>
            e.source === currentNode.id &&
            e.sourceHandle === buttonId
    );

    if (!edge) return;

    executeNode(edge.target);
};
    // Handle template button click
    const handleTemplateButtonClick = (button, buttonIndex) => {
        if (!currentNode) return;
        setMessages((prev) => [...prev, { type: "user", text: button.text }]);
        const edge = edges.find(
            (e) => e.source === currentNode.id && e.sourceHandle === `button-${buttonIndex}`
        );
        if (!edge) return;
        executeNode(edge.target);
    };

    // Open list modal
    const openListOptions = (message) => {
        setActiveList(message);
    };

    // Handle list row selection from modal
    const handleListRowClickModal = (nodeId, rowHandle, rowText) => {
        setMessages((prev) => [...prev, { type: "user", text: rowText }]);
        setActiveList(null);
        let edge = edges.find((e) => e.source === nodeId && e.sourceHandle === rowHandle);
        if (!edge) {
            // Fallback: try to match by index
            const nodeEdges = edges.filter((e) => e.source === nodeId);
            const handleIndexMatch = rowHandle.match(/row-(\d+)/);
            if (handleIndexMatch) {
                const targetIndex = parseInt(handleIndexMatch[1], 10);
                const sortedEdges = [...nodeEdges].sort((a, b) => {
                    const aNum = parseInt((a.sourceHandle || "").replace(/\D/g, ""), 10) || 0;
                    const bNum = parseInt((b.sourceHandle || "").replace(/\D/g, ""), 10) || 0;
                    return aNum - bNum;
                });
                edge = sortedEdges[targetIndex];
            }
        }
        if (!edge) return;
        executeNode(edge.target);
    };

    // Handle input submit
    const handleInputSubmit = () => {
        if (!inputValue.trim() || !currentNode) return;
        if (currentNode.type !== "input") return;
        const processedValue = inputValue.trim();
        const varName = currentNode.data.varName || currentNode.id;
        setMessages((prev) => [...prev, { type: "user", text: processedValue }]);
        setVariables((prev) => ({ ...prev, [varName]: processedValue }));
        setInputValue("");
        setTimeout(() => moveToNextNode(currentNode), 100);
    };

    // Auto-advance for non-interactive nodes
    useEffect(() => {
        if (!currentNode) return;

        if (currentNode.type === "condition") {
            const timer = setTimeout(() => evaluateCondition(currentNode), 800);
            return () => clearTimeout(timer);
        }
        if (currentNode.type === "wa_media") {
            const timer = setTimeout(() => moveToNextNode(currentNode), 2000);
            return () => clearTimeout(timer);
        }
        if (currentNode.type === "api") {
            executeApiCall(currentNode);
            return;
        }
        if (currentNode.type === "delay") {
            const timer = setTimeout(() => executeDelay(currentNode), 300);
            return () => clearTimeout(timer);
        }
        if (currentNode.type === "end_session") {
            const timer = setTimeout(() => executeEndSession(currentNode), 500);
            return () => clearTimeout(timer);
        }
        if (currentNode.type === "wa_template") return;
        if (currentNode.type === "wa_list") {
            // Display list message
            const sections = (currentNode.data.sections || []).map((section, si) => ({
                ...section,
                rows: (section.rows || []).map((row, ri) => ({
                    text: row.title,
                    handleId: `row-${ri}`,
                })),
            }));
            setMessages((prev) => [
                ...prev,
                {
                    type: "waList",
                    body: currentNode.data.body,
                    buttonText: currentNode.data.buttonText,
                    sections: sections,
                    nodeId: currentNode.id,
                },
            ]);
            return;
        }
        if (currentNode.type === "wa_buttons") return;
        if (currentNode.type === "input") {
            if (currentNode.data.prompt) {
                setMessages((prev) => [...prev, { type: "bot", node: currentNode }]);
            }
            return;
        }
        // Default: move to next node
        const timer = setTimeout(() => moveToNextNode(currentNode), 800);
        return () => clearTimeout(timer);
    }, [currentNode, nodes, edges]);

    // Reset and start flow when modal opens
    useEffect(() => {
        if (!isOpen || nodes.length === 0) return;
        setMessages([]);
        setCurrentNode(null);
        setVariables({});
        setInputValue("");
        setActiveList(null);
        setIsLoading(false);
        setIsDelaying(false);
        setSelectedButtons({});
        // Try to find Start node (primary: type === "start", fallback: any node named/typed "Start")
        const startNode =
          nodes.find((node) => node.type === "start") ||
          nodes.find((node) => node.type === "Start");

        // Debugging to understand why preview is blank
        // eslint-disable-next-line no-console
        console.log("Preview init:", {
          isOpen,
          nodesCount: nodes.length,
          edgesCount: edges.length,
          startNode: startNode ? { id: startNode.id, type: startNode.type } : null,
          startNodeTypes: nodes.map((n) => n.type),
        });

        if (!startNode) {
          // eslint-disable-next-line no-console
          console.warn("Preview: no start node found. node types:", nodes.map((n) => n.type));
          return;
        }

        // Take the first outgoing edge from Start
        const outgoing = edges.filter((edge) => edge.source === startNode.id);
        // eslint-disable-next-line no-console
        console.log("Preview outgoing edges from start:", {
          startNodeId: startNode.id,
          outgoing,
        });

        if (!outgoing.length) {
          // eslint-disable-next-line no-console
          console.warn("Preview: start node has no outgoing edges", {
            startNode,
            edges,
          });
          return;
        }

        const startEdge = outgoing[0];
        // eslint-disable-next-line no-console
        console.log("Preview starting from edge:", {
          startNodeId: startNode.id,
          startEdge,
        });

        executeNode(startEdge.target);
    }, [isOpen, nodes, edges]);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, activeList]);

    useEffect(() => {
        if (currentNode?.type === "input" && inputRef.current) {
            inputRef.current.focus();
        }
    }, [currentNode]);

    if (!isOpen) return null;

    const isInputActive = currentNode?.type === "input";
    const lastMessageIndex = messages.length - 1;

    return (
        <>
            <style>{`
                /* Preview */
                .preview-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.45);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }

                .preview-modal {
                    width: 360px;
                    height: 700px;
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .preview-header {
                    background: #075e54;
                    color: white;
                    padding: 14px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .preview-chat {
                    flex: 1;
                    overflow-y: auto;
                    background: #ece5dd;
                    padding: 15px;
                }

                .bot-message {
                    background: white;
                    padding: 10px 14px;
                    border-radius: 10px;
                    max-width: 75%;
                    margin-bottom: 10px;
                }

                .close-btn {
                    background: transparent;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                }
            `}</style>
            <div className="preview-overlay">
                <div
                    className="preview-modal"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        height: "600px",
                        maxHeight: "90vh",
                        position: "relative",
                    }}
                >
                    {/* Header */}
                    <div className="preview-header" style={{ flexShrink: 0 }}>
                        <div>
                            <strong>digiLATERAL</strong>
                            <div style={{ fontSize: "12px" }}>online</div>
                        </div>
                        <button className="close-btn" onClick={onClose}>
                            ✕
                        </button>
                    </div>

                    {/* Chat area */}
                    <div
                        className="preview-chat"
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: "16px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                        }}
                    >
                        {messages.map((message, index) => {
                            if (message.type === "user") {
                                return (
                                    <div key={index} style={{ display: "flex", justifyContent: "flex-end" }}>
                                        <div
                                            style={{
                                                background: "#DCF8C6",
                                                padding: "10px 14px",
                                                borderRadius: "18px 18px 4px 18px",
                                                maxWidth: "75%",
                                                fontSize: "14px",
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {message.text}
                                        </div>
                                    </div>
                                );
                            }

                            if (message.type === "bot" && message.text) {
                                return (
                                    <div key={index} style={{ display: "flex", justifyContent: "flex-start" }}>
                                        <div
                                            style={{
                                                background: "white",
                                                padding: "10px 14px",
                                                borderRadius: "18px 18px 18px 4px",
                                                maxWidth: "75%",
                                                fontSize: "14px",
                                                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {replaceVariables(message.text)}
                                        </div>
                                    </div>
                                );
                            }

                            if (message.type === "waList") {
                                const isLastMessage = index === messages.length - 1;
                                return (
                                    <div key={index}>
                                        <div
                                            style={{
                                                background: "white",
                                                padding: "10px 14px",
                                                borderRadius: "18px 18px 18px 4px",
                                                maxWidth: "75%",
                                                fontSize: "14px",
                                                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                                wordBreak: "break-word",
                                                marginBottom: "6px",
                                            }}
                                        >
                                            {replaceVariables(message.body)}
                                        </div>
                                        <p style={{ marginTop: "6px", fontSize: "11px", color: "#999" }}>
                                            📋 WhatsApp List
                                        </p>
                                        {isLastMessage && (
                                            <button
                                                onClick={() => openListOptions(message)}
                                                style={{
                                                    display: "block",
                                                    padding: "10px 14px",
                                                    borderRadius: "8px",
                                                    border: "1px solid #25D366",
                                                    background: "#25D366",
                                                    color: "white",
                                                    cursor: "pointer",
                                                    fontWeight: "500",
                                                    fontSize: "13px",
                                                    textAlign: "center",
                                                    marginTop: "4px",
                                                    maxWidth: "75%",
                                                }}
                                            >
                                                📋 {replaceVariables(message.buttonText)}
                                            </button>
                                        )}
                                    </div>
                                );
                            }

                            const node = message.node;
                            const isLastMessage = index === lastMessageIndex;

                            return (
                                <div key={index}>
                                    {(node.data.text ||
  node.data.message ||
  node.data.prompt) && (
                                        <div
                                            style={{
                                                background: "white",
                                                padding: "10px 14px",
                                                borderRadius: "18px 18px 18px 4px",
                                                maxWidth: "75%",
                                                fontSize: "14px",
                                                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                                wordBreak: "break-word",
                                                marginBottom: "6px",
                                            }}
                                        >
                                          {replaceVariables(
  node.data.text ||
  node.data.message ||
  node.data.prompt
)}
                                        </div>
                                    )}

                                    {isLoading && node.type === "api" && isLastMessage && (
                                        <div
                                            style={{
                                                background: "white",
                                                padding: "10px 14px",
                                                borderRadius: "18px 18px 18px 4px",
                                                maxWidth: "75%",
                                                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                                marginBottom: "6px",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                            }}
                                        >
                                            <span style={{ fontSize: "16px" }}>⏳</span>
                                            <span style={{ fontSize: "13px", color: "#666" }}>Calling API...</span>
                                        </div>
                                    )}

                                    {/* WA List Node */}
                                    {node.type === "wa_list" && (
                                        <div
                                            style={{
                                                background: "white",
                                                borderRadius: "12px",
                                                maxWidth: "80%",
                                                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                                marginBottom: "6px",
                                                overflow: "hidden",
                                            }}
                                        >
                                            <div style={{ padding: "10px 14px" }}>
                                                <p style={{ margin: 0, fontSize: "14px", color: "#333", lineHeight: "1.4" }}>
                                                    {replaceVariables(node.data.body || "Please pick an option")}
                                                </p>
                                                <p style={{ marginTop: "6px", fontSize: "11px", color: "#999" }}>📋 WhatsApp List</p>
                                            </div>
                                            {isLastMessage && !activeList && (
                                                <div style={{ padding: "8px 14px 14px 14px", borderTop: "1px solid #eee" }}>
                                                    <button
                                                        onClick={() => openListOptions({
                                                            nodeId: node.id,
                                                            body: node.data.body,
                                                            buttonText: node.data.buttonText,
                                                            sections: node.data.sections || []
                                                        })}
                                                        style={{
                                                            display: "block",
                                                            width: "100%",
                                                            padding: "10px 14px",
                                                            borderRadius: "8px",
                                                            border: "1px solid #25D366",
                                                            background: "#25D366",
                                                            color: "white",
                                                            cursor: "pointer",
                                                            fontWeight: "500",
                                                            fontSize: "13px",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        📋 {replaceVariables(node.data.buttonText || "View options")}
                                                    </button>
                                                </div>
                                            )}
                                            {isLastMessage && activeList && activeList.nodeId === node.id && (
                                                <div style={{ padding: "8px 14px 14px 14px", borderTop: "1px solid #eee", background: "#f9f9f9" }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                                        <strong style={{ fontSize: "13px" }}>Select an option</strong>
                                                        <button onClick={() => setActiveList(null)} style={{ background: "none", border: "none", fontSize: "16px", cursor: "pointer", color: "#999" }}>✕</button>
                                                    </div>
                                                    {(node.data.sections || []).map((section, sectionIndex) => (
                                                        <div key={sectionIndex} style={{ marginBottom: "10px" }}>
                                                            {section.title && (
                                                                <p style={{ fontSize: "11px", fontWeight: "600", color: "#888", textTransform: "uppercase", marginBottom: "4px", paddingLeft: "4px" }}>
                                                                    {section.title}
                                                                </p>
                                                            )}
                                                            {(section.rows || []).map((row, rowIndex) => (
                                                                <button
                                                                    key={rowIndex}
                                                                    onClick={() => handleListRowClickModal(node.id, `row-${rowIndex}`, row.title)}
                                                                    style={{
                                                                        display: "block",
                                                                        width: "100%",
                                                                        padding: "10px 14px",
                                                                        marginBottom: "4px",
                                                                        borderRadius: "8px",
                                                                        border: "1px solid #e0e0e0",
                                                                        background: "white",
                                                                        color: "#333",
                                                                        cursor: "pointer",
                                                                        fontSize: "13px",
                                                                        textAlign: "left",
                                                                    }}
                                                                    onMouseEnter={(e) => { e.target.style.background = "#E8F5E9"; e.target.style.borderColor = "#25D366"; }}
                                                                    onMouseLeave={(e) => { e.target.style.background = "white"; e.target.style.borderColor = "#e0e0e0"; }}
                                                                >
                                                                    {replaceVariables(row.title)}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* WA Template Node */}
                                    {node.type === "wa_template" && (
                                        <div
                                            style={{
                                                background: "white",
                                                borderRadius: "12px",
                                                maxWidth: "80%",
                                                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                                marginBottom: "6px",
                                                overflow: "hidden",
                                            }}
                                        >
                                            {node.data.headerType && node.data.headerType !== "none" && (
                                                <div style={{ padding: "8px", background: "#f5f5f5" }}>
                                                    {node.data.headerType === "text" && (
                                                        <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#333" }}>
                                                            {replaceVariables(node.data.headerValue || "")}
                                                        </p>
                                                    )}
                                                    {node.data.headerType === "image" && (
                                                        <img src={replaceVariables(node.data.headerValue || "")} alt="Header" style={{ width: "100%", maxHeight: "200px", objectFit: "cover", display: "block" }} />
                                                    )}
                                                    {node.data.headerType === "video" && (
                                                        <video controls style={{ width: "100%", maxHeight: "200px" }}>
                                                            <source src={replaceVariables(node.data.headerValue || "")} />
                                                        </video>
                                                    )}
                                                    {node.data.headerType === "document" && (
                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px" }}>
                                                            <span style={{ fontSize: "24px" }}>📄</span>
                                                            <a href={replaceVariables(node.data.headerValue || "")} target="_blank" rel="noopener noreferrer" style={{ color: "#25D366", fontSize: "13px" }}>Document</a>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <div style={{ padding: "10px 14px" }}>
                                                <p style={{ margin: 0, fontSize: "14px", color: "#333", lineHeight: "1.4" }}>
                                                    <strong>{node.data.name || "Template"}</strong>
                                                </p>
                                                {node.data.bodyParams && node.data.bodyParams.length > 0 && (
                                                    <div style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>
                                                        {node.data.bodyParams.map((varName, i) => (
                                                            <span key={i} style={{ display: "inline-block", background: "#E8F5E9", padding: "2px 8px", borderRadius: "4px", margin: "2px 4px 2px 0", fontSize: "11px" }}>
                                                                {`{{${varName}}}`} = {variables[varName] || "___"}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <p style={{ marginTop: "8px", fontSize: "12px", color: "#999" }}>
                                                    {node.data.language?.toUpperCase() || "EN"} • WhatsApp Template
                                                </p>
                                            </div>
                                            {node.data.buttons && node.data.buttons.length > 0 && isLastMessage && (
                                                <div style={{ padding: "8px 14px 14px 14px", borderTop: "1px solid #eee" }}>
                                                    {node.data.buttons.map((button, buttonIndex) => (
                                                        <button
                                                            key={buttonIndex}
                                                            onClick={() => handleTemplateButtonClick(button, buttonIndex)}
                                                            style={{
                                                                display: "block",
                                                                width: "100%",
                                                                padding: "10px 14px",
                                                                marginBottom: "6px",
                                                                borderRadius: "8px",
                                                                border: "1px solid #25D366",
                                                                background: "white",
                                                                color: "#25D366",
                                                                cursor: "pointer",
                                                                fontWeight: "500",
                                                                fontSize: "13px",
                                                                textAlign: "center",
                                                            }}
                                                            onMouseEnter={(e) => { e.target.style.background = "#f0fff4"; }}
                                                            onMouseLeave={(e) => { e.target.style.background = "white"; }}
                                                        >
                                                            {button.type === "url" ? "🔗 " : button.type === "phone_number" ? "📞 " : "↩ "}
                                                            {replaceVariables(button.text) || "Button"}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* WA Media */}
                                    {node.type === "wa_media" && node.data.mediaType === "image" && (
                                        <div style={{ background: "white", padding: "8px", borderRadius: "12px", maxWidth: "75%", boxShadow: "0 1px 2px rgba(0,0,0,0.1)", marginBottom: "6px" }}>
                                            <img src={replaceVariables(node.data.url)} alt={node.data.caption || "Image"} style={{ width: "100%", borderRadius: "8px", display: "block" }} />
                                            {node.data.caption && <p style={{ marginTop: "8px", fontSize: "12px", color: "#666", textAlign: "center" }}>{replaceVariables(node.data.caption)}</p>}
                                        </div>
                                    )}
                                    {node.type === "wa_media" && node.data.mediaType === "video" && (
                                        <div style={{ background: "white", padding: "8px", borderRadius: "12px", maxWidth: "75%", boxShadow: "0 1px 2px rgba(0,0,0,0.1)", marginBottom: "6px" }}>
                                            <video controls style={{ width: "100%", borderRadius: "8px", display: "block" }}>
                                                <source src={replaceVariables(node.data.url)} />
                                            </video>
                                            {node.data.caption && <p style={{ marginTop: "8px", fontSize: "12px", color: "#666", textAlign: "center" }}>{replaceVariables(node.data.caption)}</p>}
                                        </div>
                                    )}
                                    {node.type === "wa_media" && node.data.mediaType === "audio" && (
                                        <div style={{ background: "white", padding: "10px 14px", borderRadius: "18px 18px 18px 4px", maxWidth: "75%", boxShadow: "0 1px 2px rgba(0,0,0,0.1)", marginBottom: "6px" }}>
                                            <audio controls style={{ width: "100%" }}>
                                                <source src={replaceVariables(node.data.url)} />
                                            </audio>
                                            {node.data.caption && <p style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>{replaceVariables(node.data.caption)}</p>}
                                        </div>
                                    )}
                                    {node.type === "wa_media" && node.data.mediaType === "document" && (
                                        <div style={{ background: "white", padding: "10px 14px", borderRadius: "18px 18px 18px 4px", maxWidth: "75%", boxShadow: "0 1px 2px rgba(0,0,0,0.1)", marginBottom: "6px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <span style={{ fontSize: "24px" }}>📄</span>
                                                <a href={replaceVariables(node.data.url)} target="_blank" rel="noopener noreferrer" style={{ color: "#25D366", textDecoration: "underline", fontSize: "14px" }}>{node.data.caption || "Open Document"}</a>
                                            </div>
                                        </div>
                                    )}
                                    {node.type === "wa_media" && node.data.mediaType === "sticker" && (
                                        <div style={{ background: "white", padding: "8px", borderRadius: "12px", maxWidth: "50%", boxShadow: "0 1px 2px rgba(0,0,0,0.1)", marginBottom: "6px" }}>
                                            <img src={replaceVariables(node.data.url)} alt="Sticker" style={{ width: "100%", maxWidth: "150px", borderRadius: "8px", display: "block" }} />
                                        </div>
                                    )}

                                    {/* WA Buttons */}
                                    {node.type === "wa_buttons" && node.data.options && (
    <div>
        {selectedButtons[node.id] ? (
            <div
                style={{
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid #25D366",
                    color: "#25D366",
                    textAlign: "center",
                    background: "white"
                }}
            >
                ✓ Selected: {selectedButtons[node.id]}
            </div>
        ) : (
            isLastMessage &&
            node.data.options.map((option) => (
                <button
                    key={option.id}
                    onClick={() =>
                        handleButtonClick(
                            option.title,
                            option.id
                        )
                    }
                    style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 14px",
                        marginBottom: "6px",
                        borderRadius: "10px",
                        border: "1px solid #25D366",
                        background: "white",
                        color: "#25D366",
                        cursor: "pointer"
                    }}
                >
                    ↩ {option.title}
                </button>
            ))
        )}
    </div>
)}
                                </div>
                            );
                        })}
                        <div ref={chatEndRef} />
                    </div>

                    {/* List Modal Popup */}
                    {activeList && activeList.sections && (
                        <div
                            style={{
                                position: "absolute",
                                bottom: "80px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: "90%",
                                maxWidth: "300px",
                                background: "white",
                                borderRadius: "12px",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                                zIndex: 1000,
                                overflow: "hidden",
                                animation: "slideUp 0.3s ease",
                            }}
                        >
                            <div style={{ padding: "12px", background: "#075E54", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <strong>Select an option</strong>
                                <button onClick={() => setActiveList(null)} style={{ background: "none", border: "none", color: "white", fontSize: "20px", cursor: "pointer" }}>✕</button>
                            </div>
                            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                                {activeList.sections.map((section, sectionIndex) => (
                                    <div key={sectionIndex} style={{ padding: "8px 0" }}>
                                        {section.title && (
                                            <div style={{ padding: "8px 12px", background: "#f0f0f0", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>
                                                {section.title}
                                            </div>
                                        )}
                                        {(section.rows || []).map((row, rowIndex) => (
                                            <button
                                                key={rowIndex}
                                                onClick={() => handleListRowClickModal(activeList.nodeId, row.handleId, row.text)}
                                                style={{
                                                    display: "block",
                                                    width: "100%",
                                                    padding: "12px 16px",
                                                    border: "none",
                                                    borderBottom: "1px solid #eee",
                                                    background: "white",
                                                    textAlign: "left",
                                                    cursor: "pointer",
                                                    fontSize: "14px",
                                                }}
                                                onMouseEnter={(e) => { e.target.style.background = "#E8F5E9"; }}
                                                onMouseLeave={(e) => { e.target.style.background = "white"; }}
                                            >
                                                {replaceVariables(row.text)}
                                            </button>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bottom input bar */}
                    <div
                        style={{
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 12px",
                            background: "#f0f0f0",
                            borderTop: "1px solid #ddd",
                        }}
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleInputSubmit(); }}
                            placeholder={isInputActive ? currentNode?.data?.placeholder || "Type a message..." : "Use the buttons above to respond"}
                            disabled={!isInputActive}
                            style={{
                                flex: 1,
                                padding: "10px 16px",
                                borderRadius: "24px",
                                border: "none",
                                fontSize: "14px",
                                outline: "none",
                                background: isInputActive ? "white" : "#e0e0e0",
                                color: isInputActive ? "#111" : "#999",
                                cursor: isInputActive ? "text" : "default",
                                transition: "all 0.2s",
                                boxShadow: isInputActive ? "0 0 0 2px #25D366" : "none",
                            }}
                        />
                        <button
                            onClick={handleInputSubmit}
                            disabled={!isInputActive || !inputValue.trim()}
                            style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "50%",
                                border: "none",
                                background: isInputActive && inputValue.trim() ? "#25D366" : "#bbb",
                                color: "white",
                                cursor: isInputActive && inputValue.trim() ? "pointer" : "not-allowed",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "16px",
                                flexShrink: 0,
                            }}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
// ==================== END PREVIEW MODAL ====================

// ---------- Palette ----------
function Palette() {
  const onDragStart = (event, type) => {
    event.dataTransfer.setData("application/reactflow", type);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="p-3 text-[12px]">
      <div className="text-[12px] font-semibold mb-2">Blocks</div>
      <div className="grid grid-cols-2 gap-2">
        {paletteItems.map((p) => (
          <div
            key={p.type}
            draggable
            onDragStart={(e) => onDragStart(e, p.type)}
            className="border rounded-lg p-2 text-center cursor-grab active:cursor-grabbing bg-[#dcf8c6] hover:bg-[#ece5dd]"
          >
            {p.label}
          </div>
        ))}
      </div>
      <div className="mt-3 text-[11px] text-gray-500">
        Drag a block onto the canvas
      </div>
    </div>
  );
}

function FlowNameDialog({ isOpen, onClose, onConfirm }) {
  const [flowName, setFlowName] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">Save Flow</h3>
        <input
          type="text"
          className="w-full border rounded-lg p-2 mb-4"
          placeholder="Enter flow name..."
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 border rounded-lg" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            onClick={() => {
              if (flowName.trim()) {
                onConfirm(flowName.trim());
                setFlowName("");
              }
            }}
            disabled={!flowName.trim()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function FlowTriggerSettings({ flow, setFlow }) {
  return (
    <div className="p-3 border-t">
      <div className="text-sm font-semibold mb-2">Trigger Settings</div>
      <div className="mb-3">
        <label className="block text-xs text-gray-500 mb-1">
          Custom Trigger Keywords (optional)
        </label>
        <input
          type="text"
          className="w-full border rounded p-2 text-xs"
          placeholder="hello, hi, welcome"
          value={flow.triggerKeywords?.join(", ") || ""}
          onChange={(e) => {
            const keywords = e.target.value
              .split(",")
              .map((k) => k.trim())
              .filter((k) => k.length > 0);
            setFlow({ ...flow, triggerKeywords: keywords });
          }}
        />
        <div className="text-xs text-gray-400 mt-1">
          If empty, will use the first message text as trigger
        </div>
      </div>
    </div>
  );
}

// ---------- Main App ----------
export default function ChatbotFlowBuilder() {
  const { id: userId } = useParams();
  const rfWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([
    { id: "start_0", type: "start", position: { x: 120, y: 80 }, data: {} },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selection, setSelection] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [warnings, setWarnings] = useState([]);
  const [showFlowNameDialog, setShowFlowNameDialog] = useState(false);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;
      const bounds = rfWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });
      const node = createNode(type, position);
      setNodes((nds) => nds.concat(node));
    },
    [reactFlowInstance]
  );

  const onConnect = useCallback(
    (params) => {
      const srcNode = nodes.find((n) => n.id === params.source);
      let label;
      if (srcNode?.type === "wa_buttons" && params.sourceHandle) {
        const opt = (srcNode.data.options || []).find(
          (o) => o.id === params.sourceHandle
        );
        label = opt?.title;
      }
      setEdges((eds) => addEdge({ ...params, animated: false, label }, eds));
    },
    [nodes]
  );

  const onSelectionChange = useCallback((selection) => {
    setSelection(selection.nodes?.[0] || null);
  }, []);

  const saveFlow = () => {
    handleSaveWithName();
  };

  const handleSaveWithName = async () => {
    try {
const data = {
        name: `Flow_${Date.now()}`,
        nodes: nodes.map((n) => {
          if (n?.type === "wa_buttons" && Array.isArray(n?.data?.options)) {
            return {
              ...n,
              data: {
                ...n.data,
                options: n.data.options.map((opt) => ({
                  ...opt,
                  // keep old keys, just also mirror into title
                  title: opt?.title,
                  text: opt?.title,
                })),
              },
            };
          }
          return n;
        }),
        edges,
      };

      const response = await fetch(
        ` http://localhost:7821/api/admin/addFlows/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert("Flow saved successfully!");
        if (result.warnings && result.warnings.length > 0) {
          setWarnings(result.warnings);
        }
      } else {
        alert("Failed to save flow: " + result.message);
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving flow");
    }
  };

  const loadFlows = async () => {
    try {
      const response = await fetch(
        ` http://localhost:7821/api/admin/flows/${userId}`
      );
      const result = await response.json();

      if (result.success) {
        setFlowsList(result.data);
      }
    } catch (error) {
      console.error("Load error:", error);
    }
  };

  const loadFlow = async (flowId) => {
    try {
      const response = await fetch(
        ` http://localhost:7821/api/admin/flow/${flowId}`
      );
      const result = await response.json();

      if (result.success) {
        setNodes(result.data.nodes);
        setEdges(result.data.edges);
      }
    } catch (error) {
      console.error("Load error:", error);
    }
  };

  const importFromFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const obj = JSON.parse(reader.result);
          if (obj?.nodes) setNodes(obj.nodes);
          if (obj?.edges) setEdges(obj.edges);
        } catch {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  useEffect(() => {
    const saved = localStorage.getItem("chatbot_flow");
    if (saved) {
      try {
        const obj = JSON.parse(saved);
        if (obj?.nodes) setNodes(obj.nodes);
        if (obj?.edges) setEdges(obj.edges);
      } catch {}
    }
  }, []);

  const openPreview = () => {
    const issues = validateFlow(nodes, edges);
    setWarnings(issues);
    setShowPreview(true);
  };
  const exportMeta = () => {
    const out = exportToMetaMessages(nodes, edges);
    download(`wa_messages_${Date.now()}.json`, JSON.stringify(out, null, 2));
  };

  return (
    <>
      <div className="w-full">
        <div className="bg-[#ece5dd] h-[100dvh] overflow-hidden">
          <div className="bg-[#dcf8c6]">
            <Header pageName={"Flow Builder"} />
          </div>
          <div className="w-full h-[92vh] flex bg-gray-100">
            {/* Left: Palette */}
            <div className="w-[240px] border-r bg-white">
              <Palette />
              <div className="p-3 border-t text-[11px] text-gray-500">
                <div className="font-semibold text-gray-700 mb-1">WA Tips</div>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Buttons ≤ 3, ≤ 20 chars</li>
                  <li>List rows ≤ 10/section</li>
                  <li>Template requires approval before sending</li>
                </ul>
              </div>
            </div>

            {/* Center: Canvas */}
            <div className="flex-1 relative">
              <div className="absolute inset-x-0 top-0 z-10 p-2 flex items-center gap-2">
                <button
                  className="px-2 py-1 border rounded bg-white text-xs"
                  onClick={() => reactFlowInstance?.fitView()}
                >
                  Fit
                </button>
                <button
                  className="px-2 py-1 border rounded bg-white text-xs"
                  onClick={saveFlow}
                >
                  Save
                </button>
                <button
                  className="px-2 py-1 border rounded bg-white text-xs"
                  onClick={importFromFile}
                >
                  Load
                </button>
                <button
                  className="px-2 py-1 border rounded bg-white text-xs"
                  onClick={openPreview}
                >
                  Preview
                </button>
                <button
                  className="px-2 py-1 border rounded bg-white text-xs"
                  onClick={exportMeta}
                >
                  Export → Meta JSON
                </button>
                {warnings.length > 0 && (
                  <div className="text-[11px] text-amber-700 bg-amber-100 border border-amber-300 rounded px-2 py-1">
                    {warnings[0]}
                  </div>
                )}
              </div>
              <div className="w-full h-full" ref={rfWrapper}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onInit={setReactFlowInstance}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  fitView
                  nodeTypes={nodeTypes}
                  onSelectionChange={onSelectionChange}
                  defaultEdgeOptions={{ markerEnd: { type: "arrowclosed" } }}
                >
                  <MiniMap zoomable pannable />
                  <Controls />
                  <Background gap={24} />
                </ReactFlow>
              </div>
            </div>

            {/* Right: Inspector */}
            <div className="w-[360px] border-l bg-white flex flex-col">
              <div className="p-3 border-b shrink-0">
                <div className="font-semibold text-sm">Inspector</div>
                <div className="text-[11px] text-gray-500">
                  Edit selected node
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <Inspector
                  node={selection}
                  setNodes={setNodes}
                  edges={edges}
                  setEdges={setEdges}
                />
              </div>
            </div>

            {/* Integrated Preview Modal */}
            <PreviewModal
              isOpen={showPreview}
              onClose={() => setShowPreview(false)}
              nodes={nodes}
              edges={edges}
            />
          </div>
        </div>

        <FlowNameDialog
          isOpen={showFlowNameDialog}
          onClose={() => setShowFlowNameDialog(false)}
          onConfirm={handleSaveWithName}
        />
      </div>
    </>
  );
}