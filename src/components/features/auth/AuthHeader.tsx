interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
      <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
    </>
  );
}
