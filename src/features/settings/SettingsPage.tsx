import { type ChangeEvent, useRef, useState } from 'react';
import { PurityBadge } from '../../components/Badge.tsx';
import { NumberField, SelectField } from '../../components/Fields.tsx';
import { Panel } from '../../components/Panel.tsx';
import { DEFAULT_BASE, SITES } from '../../content/index.ts';
import { DATA_META, NODE_BY_ID, itemName } from '../../data/gameData.ts';
import type { Purity, ResourceNode } from '../../data/types.ts';
import { createBackup, resetAll, restoreBackup } from '../../state/backup.ts';
import { useSettings } from '../../state/settings.ts';

/** Purity applies to ordinary nodes and well satellites, not well cores or geysers. */
const isOverridable = (node: ResourceNode | undefined): node is ResourceNode =>
  !!node && node.type !== 'well-core' && node.resource !== 'geothermal';

export function SettingsPage() {
  const { base, setBase, currentTier, setCurrentTier, purityOverrides, setPurityOverride } =
    useSettings();
  const [message, setMessage] = useState<{ tone: 'ok' | 'danger'; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(createBackup(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ficsit-field-guide-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ tone: 'ok', text: 'Backup downloaded.' });
  };

  const importBackup = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      restoreBackup(JSON.parse(await file.text()));
      setMessage({ tone: 'ok', text: `Restored from ${file.name}.` });
    } catch (error) {
      setMessage({
        tone: 'danger',
        text: error instanceof Error ? error.message : 'Could not read that file.',
      });
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl">Settings</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Base location"
          description="Distances and bearings everywhere are measured from here. Metres; north is −y."
        >
          <div className="grid grid-cols-3 gap-3">
            <NumberField
              label="x (east)"
              value={base.x}
              min={-4000}
              max={5000}
              onChange={(x) => setBase({ ...base, x })}
            />
            <NumberField
              label="y (south)"
              value={base.y}
              min={-4000}
              max={4000}
              onChange={(y) => setBase({ ...base, y })}
            />
            <NumberField
              label="z (height)"
              value={base.z}
              min={-500}
              max={1000}
              onChange={(z) => setBase({ ...base, z })}
            />
          </div>
          <button
            type="button"
            onClick={() => setBase({ ...DEFAULT_BASE })}
            className="border-line-strong hover:border-accent mt-3 rounded border px-3 py-1.5 text-sm"
          >
            Reset to the Rocky Desert HUB Basin
          </button>
          <p className="text-ink-faint mt-2 text-xs">
            Tip: you can also set it by clicking on the Explore map.
          </p>
        </Panel>

        <Panel
          title="Progress"
          description="Your current tier drives “openable now” filters and tier warnings."
        >
          <SelectField
            label="Current tier"
            value={String(currentTier)}
            onChange={(v) => setCurrentTier(Number(v))}
            options={Array.from({ length: 10 }, (_, t) => ({
              value: String(t),
              label: `Tier ${t}`,
            }))}
            className="max-w-xs"
          />
        </Panel>
      </div>

      <Panel
        title="Node purity overrides"
        description="Using Update 1.2 Game Modes with randomised purity? Set what your save actually has. Layout defaults update automatically."
      >
        <div className="space-y-5">
          {SITES.filter((site) => site.nodeIds.some((id) => isOverridable(NODE_BY_ID.get(id)))).map(
            (site) => (
              <section key={site.id} aria-labelledby={`purity-${site.id}`}>
                <h3 id={`purity-${site.id}`} className="mb-2 text-base">
                  {site.name}
                </h3>
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {site.nodeIds.map((id) => {
                    const node = NODE_BY_ID.get(id);
                    if (!isOverridable(node)) return null;
                    const override = purityOverrides[id];
                    return (
                      <li key={id} className="tile flex items-end justify-between gap-2 p-2">
                        <div className="text-sm">
                          <p>{itemName(node.resource)}</p>
                          <p className="text-ink-faint text-xs">
                            Default <PurityBadge purity={node.purity} /> · ({Math.round(node.x)},{' '}
                            {Math.round(node.y)})
                          </p>
                        </div>
                        <SelectField
                          label={`${itemName(node.resource)} purity at ${Math.round(node.x)}, ${Math.round(node.y)}`}
                          hideLabel
                          value={override ?? ''}
                          onChange={(v) =>
                            setPurityOverride(id, (v || undefined) as Purity | undefined)
                          }
                          options={[
                            { value: '', label: 'Default' },
                            { value: 'impure', label: 'Impure' },
                            { value: 'normal', label: 'Normal' },
                            { value: 'pure', label: 'Pure' },
                          ]}
                          className="w-28"
                        />
                      </li>
                    );
                  })}
                </ul>
              </section>
            ),
          )}
        </div>
      </Panel>

      <Panel
        title="Backup"
        description="Everything is stored in this browser. Export a backup before clearing site data or switching machines."
      >
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportBackup}
            className="bg-accent text-accent-ink rounded px-3 py-1.5 text-sm font-semibold"
          >
            Export backup
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="border-line-strong hover:border-accent rounded border px-3 py-1.5 text-sm"
          >
            Import backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            aria-label="Backup file"
            tabIndex={-1}
            onChange={importBackup}
          />
          <button
            type="button"
            onClick={() => {
              if (confirmReset) {
                resetAll();
                setConfirmReset(false);
                setMessage({ tone: 'ok', text: 'All progress and settings cleared.' });
              } else {
                setConfirmReset(true);
              }
            }}
            onBlur={() => setConfirmReset(false)}
            className="border-danger/60 text-danger hover:bg-danger/10 rounded border px-3 py-1.5 text-sm"
          >
            {confirmReset ? 'Click again to erase everything' : 'Reset everything'}
          </button>
        </div>
        <p
          role="status"
          aria-live="polite"
          className={`mt-3 text-sm ${message?.tone === 'danger' ? 'text-danger' : 'text-ok'}`}
        >
          {message?.text}
        </p>
      </Panel>

      <Panel title="About the data">
        <p className="text-ink-muted text-sm">
          {DATA_META.gameVersion}. Generated {DATA_META.generatedAt}: {DATA_META.counts.recipes}{' '}
          recipes, {DATA_META.counts.items} items, {DATA_META.counts.nodes} resource nodes and{' '}
          {DATA_META.counts.collectibles} collectibles.
        </p>
        <ul className="text-ink-muted mt-2 list-disc space-y-1 pl-5 text-sm">
          {DATA_META.sources.map((s) => (
            <li key={s.url}>
              {s.name} ({s.licence})
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
