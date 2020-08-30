import * as React from "react";

export default function ClientOnly({
  children
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? <>{children}</> : null;
}

export function withClientOnly<P>(Component: React.ComponentType<P>) {
  const WithClientOnly = (props: P) => (
    <ClientOnly>
      <Component {...props} />
    </ClientOnly>
  );

  return WithClientOnly;
}
