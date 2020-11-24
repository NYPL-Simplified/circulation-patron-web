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

export function clientOnly<T>(Component: React.ComponentType<T>) {
  const Wrapped = (props: T) => (
    <ClientOnly>
      <Component {...props} />
    </ClientOnly>
  );
  // Format for display in DevTools
  const name = Component.displayName || Component.name;
  Wrapped.displayName = name ? `ClientOnly(${name})` : "ClientOnly";

  return Wrapped;
}
