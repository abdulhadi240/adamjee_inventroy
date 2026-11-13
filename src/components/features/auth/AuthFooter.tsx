import Link from "next/link";

interface AuthFooterProps {
  description: string;
  linkText: string;
  linkHref: string;
}

export function AuthFooter({ description, linkText, linkHref }: AuthFooterProps) {
  return (
    <p className="text-muted">
      {description}{" "}
      <Link href={linkHref} className="link font-semibold">
        {linkText}
      </Link>
    </p>
  );
}
