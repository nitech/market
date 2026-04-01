'use client';

import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export interface FlowStage {
  id: string;
  name: string;
}

export interface FlowCompany {
  orgnr: string;
  name: string;
  addedAt: string;
}

export interface CustomerFlowData {
  stages: FlowStage[];
  companiesByStage: Record<string, FlowCompany[]>;
}

export interface SalesFlowBoardProps {
  flow: CustomerFlowData;
  onFlowChange: (next: CustomerFlowData) => void;
}

export const DEFAULT_FLOW_STAGES: FlowStage[] = [
  { id: 'qualify', name: 'Kvalifiser' },
  { id: 'enrich', name: 'Berik' },
  { id: 'sales', name: 'Salg' },
];

export function createDefaultFlowData(): CustomerFlowData {
  const companiesByStage: Record<string, FlowCompany[]> = {};
  for (const stage of DEFAULT_FLOW_STAGES) {
    companiesByStage[stage.id] = [];
  }

  return {
    stages: DEFAULT_FLOW_STAGES,
    companiesByStage,
  };
}

export function normalizeFlowData(raw: unknown): CustomerFlowData {
  if (!raw || typeof raw !== 'object') {
    return createDefaultFlowData();
  }

  const candidate = raw as Partial<CustomerFlowData>;
  const stages = Array.isArray(candidate.stages) && candidate.stages.length > 0
    ? candidate.stages
        .filter((stage): stage is FlowStage => Boolean(stage?.id && stage?.name))
        .map((stage) => ({ id: String(stage.id), name: String(stage.name) }))
    : DEFAULT_FLOW_STAGES;

  if (stages.length === 0) {
    return createDefaultFlowData();
  }

  const companiesByStage: Record<string, FlowCompany[]> = {};
  const sourceMap = candidate.companiesByStage ?? {};

  for (const stage of stages) {
    const list = Array.isArray(sourceMap[stage.id]) ? sourceMap[stage.id] : [];
    companiesByStage[stage.id] = list
      .filter((item): item is FlowCompany => Boolean(item?.orgnr))
      .map((item) => ({
        orgnr: String(item.orgnr),
        name: String(item.name ?? 'Ukjent bedrift'),
        addedAt: String(item.addedAt ?? new Date().toISOString()),
      }));
  }

  return { stages, companiesByStage };
}

interface StageNodeData {
  label: string;
  isFirst: boolean;
  isLast: boolean;
}

function StageNode({ data }: NodeProps<Node<StageNodeData>>) {
  return (
    <div
      style={{
        width: 210,
        borderRadius: 14,
        border: '1px solid var(--gs-border-default)',
        background: 'var(--gs-bg-card)',
        color: 'var(--gs-text-primary)',
        fontWeight: 700,
        boxShadow: 'var(--gs-shadow-sm)',
        textAlign: 'center',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        padding: '12px 16px',
      }}
    >
      {!data.isFirst && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: 'var(--gs-accent-lime)', width: 10, height: 10, border: 0 }}
        />
      )}
      {!data.isLast && (
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: 'var(--gs-accent-lime)', width: 10, height: 10, border: 0 }}
        />
      )}
      {data.label}
    </div>
  );
}

const nodeTypes = {
  stage: StageNode,
};

function toStageNodes(stages: FlowStage[]) {
  return stages.map((stage, index) => ({
    id: stage.id,
    type: 'stage',
    position: { x: index * 260, y: 20 },
    data: {
      label: stage.name,
      isFirst: index === 0,
      isLast: index === stages.length - 1,
    },
  }));
}

function toStageEdges(stages: FlowStage[]) {
  return stages.slice(0, -1).map((stage, index) => ({
    id: `${stage.id}-${stages[index + 1].id}`,
    source: stage.id,
    target: stages[index + 1].id,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: 'var(--gs-accent-lime)',
    },
    style: { stroke: 'var(--gs-accent-lime)', strokeWidth: 2.2 },
  }));
}

export function SalesFlowBoard({ flow, onFlowChange }: SalesFlowBoardProps) {
  const stageNodes = useMemo(() => toStageNodes(flow.stages), [flow.stages]);
  const stageEdges = useMemo(() => toStageEdges(flow.stages), [flow.stages]);

  const updateStageName = (stageId: string, name: string) => {
    onFlowChange({
      ...flow,
      stages: flow.stages.map((stage) => (stage.id === stageId ? { ...stage, name } : stage)),
    });
  };

  const addStage = () => {
    const nextId = `stage-${crypto.randomUUID().slice(0, 8)}`;
    const nextStage = { id: nextId, name: `Nytt steg ${flow.stages.length + 1}` };
    onFlowChange({
      stages: [...flow.stages, nextStage],
      companiesByStage: {
        ...flow.companiesByStage,
        [nextId]: [],
      },
    });
  };

  const removeStage = (stageId: string) => {
    if (flow.stages.length <= 2) {
      return;
    }

    const remaining = flow.stages.filter((stage) => stage.id !== stageId);
    const fallbackStageId = remaining[0]?.id;
    if (!fallbackStageId) {
      return;
    }

    const movedCompanies = flow.companiesByStage[stageId] ?? [];
    const nextCompaniesByStage: Record<string, FlowCompany[]> = {};

    for (const stage of remaining) {
      nextCompaniesByStage[stage.id] = flow.companiesByStage[stage.id] ?? [];
    }

    nextCompaniesByStage[fallbackStageId] = [...movedCompanies, ...nextCompaniesByStage[fallbackStageId]];

    onFlowChange({
      stages: remaining,
      companiesByStage: nextCompaniesByStage,
    });
  };

  const moveCompany = (company: FlowCompany, fromStageId: string, direction: -1 | 1) => {
    const fromIndex = flow.stages.findIndex((stage) => stage.id === fromStageId);
    const targetIndex = fromIndex + direction;
    if (fromIndex < 0 || targetIndex < 0 || targetIndex >= flow.stages.length) {
      return;
    }

    const targetStageId = flow.stages[targetIndex].id;
    const nextCompaniesByStage: Record<string, FlowCompany[]> = {};
    for (const stage of flow.stages) {
      nextCompaniesByStage[stage.id] = [...(flow.companiesByStage[stage.id] ?? [])];
    }

    nextCompaniesByStage[fromStageId] = nextCompaniesByStage[fromStageId].filter((item) => item.orgnr !== company.orgnr);
    nextCompaniesByStage[targetStageId] = [company, ...nextCompaniesByStage[targetStageId]];

    onFlowChange({
      ...flow,
      companiesByStage: nextCompaniesByStage,
    });
  };

  const removeCompany = (stageId: string, orgnr: string) => {
    onFlowChange({
      ...flow,
      companiesByStage: {
        ...flow.companiesByStage,
        [stageId]: (flow.companiesByStage[stageId] ?? []).filter((item) => item.orgnr !== orgnr),
      },
    });
  };

  return (
    <section className="space-y-6">
      <div className="rounded-xl p-4 sm:p-5" style={{ background: 'var(--gs-bg-card)', border: '1px solid var(--gs-border-default)' }}>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--gs-text-primary)' }}>
          Standardflyt med egne tilpasninger
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--gs-text-tertiary)' }}>
          Standard: Kvalifiser → Berik → Salg. Steg 0 er søk og oppdagelse i Bedriftssøk.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {flow.stages.map((stage) => (
            <div key={stage.id} className="rounded-lg p-3" style={{ background: 'var(--gs-bg-secondary)', border: '1px solid var(--gs-border-default)' }}>
              <div className="flex items-center justify-between gap-2">
                <input
                  value={stage.name}
                  onChange={(event) => updateStageName(stage.id, event.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md text-sm focus:outline-none"
                  style={{ background: 'var(--gs-bg-tertiary)', border: '1px solid var(--gs-border-default)', color: 'var(--gs-text-primary)' }}
                />
                <button
                  onClick={() => removeStage(stage.id)}
                  className="px-2.5 py-1.5 rounded-md text-xs font-medium"
                  style={{ background: 'rgba(239, 68, 68, 0.14)', color: 'var(--gs-accent-red)' }}
                  title="Slett steg"
                >
                  Slett
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addStage}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: 'var(--gs-gradient-lime)', color: 'var(--gs-bg-primary)' }}
        >
          + Legg til steg
        </button>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--gs-border-default)', background: 'var(--gs-bg-secondary)' }}>
        <div className="h-[260px]">
          <ReactFlow
            nodes={stageNodes}
            edges={stageEdges}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background color="var(--gs-border-default)" gap={20} />
            <Controls />
          </ReactFlow>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {flow.stages.map((stage, index) => {
          const stageCompanies = flow.companiesByStage[stage.id] ?? [];
          return (
            <div key={stage.id} className="rounded-xl p-4" style={{ background: 'var(--gs-bg-card)', border: '1px solid var(--gs-border-default)' }}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold" style={{ color: 'var(--gs-text-primary)' }}>
                  {stage.name}
                </h3>
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--gs-bg-tertiary)', color: 'var(--gs-text-secondary)' }}>
                  {stageCompanies.length}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {stageCompanies.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--gs-text-tertiary)' }}>
                    Ingen bedrifter i dette steget.
                  </p>
                ) : (
                  stageCompanies.map((company) => (
                    <article key={company.orgnr} className="rounded-lg p-3" style={{ background: 'var(--gs-bg-secondary)', border: '1px solid var(--gs-border-default)' }}>
                      <p className="text-sm font-semibold" style={{ color: 'var(--gs-text-primary)' }}>
                        {company.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--gs-text-tertiary)' }}>
                        Org.nr: {company.orgnr}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => moveCompany(company, stage.id, -1)}
                          disabled={index === 0}
                          className="px-2 py-1 rounded text-xs"
                          style={{ background: 'var(--gs-bg-tertiary)', color: 'var(--gs-text-secondary)', opacity: index === 0 ? 0.45 : 1 }}
                        >
                          ← Tilbake
                        </button>
                        <button
                          onClick={() => moveCompany(company, stage.id, 1)}
                          disabled={index === flow.stages.length - 1}
                          className="px-2 py-1 rounded text-xs"
                          style={{ background: 'var(--gs-bg-tertiary)', color: 'var(--gs-text-secondary)', opacity: index === flow.stages.length - 1 ? 0.45 : 1 }}
                        >
                          Frem →
                        </button>
                        <button
                          onClick={() => removeCompany(stage.id, company.orgnr)}
                          className="px-2 py-1 rounded text-xs ml-auto"
                          style={{ background: 'rgba(239, 68, 68, 0.14)', color: 'var(--gs-accent-red)' }}
                        >
                          Fjern
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
