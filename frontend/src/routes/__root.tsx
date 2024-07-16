import { Outlet, createRootRoute, useRouterState } from "@tanstack/react-router"
import React, { Suspense, useEffect } from "react"

import NotFound from "../components/Common/NotFound"

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null
    : React.lazy(() =>
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      )

function extractTitleFromPath(pathname: string): string {
  const routes = [
    { path: '/', title: 'Dashboard' },
    { path: '/login', title: 'Login' },
    { path: '/recover-password', title: 'Recover Password' },
    { path: '/reset-password', title: 'Reset Password' },
    { path: '/admin', title: 'Admin' },
    { path: '/customercontacts', title: 'Customer Contacts' },
    { path: '/customers', title: 'Customers' },
    { path: '/externalinvoices', title: 'External Invoices' },
    { path: '/internalinvoices', title: 'Internal Invoices' },
    { path: '/parts', title: 'Parts' },
    { path: '/paymentstosuppliers', title: 'Payments to Suppliers' },
    { path: '/paymentsfromcustomers', title: 'Payments from Customers' },
    { path: '/projects', title: 'Projects' },
    { path: '/settings', title: 'Settings' },
    { path: '/suppliercontacts', title: 'Supplier Contacts' },
    { path: '/suppliers', title: 'Suppliers' },
  ];

  const matchedRoute = routes.find(route => 
    pathname === route.path || pathname.startsWith(`${route.path}/`)
  );

  return matchedRoute ? matchedRoute.title : 'Accounting AI';
}

function useDocumentTitle() {
  const routerState = useRouterState()

  useEffect(() => {
    const pathname = routerState.location.pathname
    const title = extractTitleFromPath(pathname)

    document.title = `${title} | Accounting AI`
  }, [routerState.location])
}

function Root() {
  useDocumentTitle()

  return (
    <>
      <Outlet />
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </>
  )
}

export const Route = createRootRoute({
  component: Root,
  notFoundComponent: () => <NotFound />,
})