type WorkspaceSwitcherProps = {
  name?: string | null;
};

export function WorkspaceSwitcher({ name }: WorkspaceSwitcherProps) {
  const label = name?.trim() || "Workspace";

  return (
    <div className="rounded-xl border border-outline-variant bg-background px-3 py-2.5">
      <p className="font-mono text-[10px] tracking-[0.16em] text-on-surface-variant uppercase">
        Workspace
      </p>
      <p className="mt-1 truncate text-sm font-medium text-on-surface">{label}</p>
    </div>
  );
}
