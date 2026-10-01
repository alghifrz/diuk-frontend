import { Card } from "@/components/ui/card";

type ComingNextProps = {
  title: string;
};

export function ComingNext({ title }: ComingNextProps) {
  return (
    <Card className="max-w-xl">
      <p className="font-mono text-[10px] tracking-[0.16em] text-on-surface-variant uppercase">
        Coming next
      </p>
      <h2 className="mt-3 text-xl font-semibold tracking-tight text-on-surface">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-on-surface-variant">
        This section is not available yet. The workspace shell is ready so it can
        be added without changing the application layout.
      </p>
    </Card>
  );
}
