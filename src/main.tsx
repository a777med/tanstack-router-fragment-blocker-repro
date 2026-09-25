import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useBlocker,
  useRouter,
} from '@tanstack/react-router'

function Editor() {
  const router = useRouter()
  const { step } = editorRoute.useSearch()
  const [draft, setDraft] = useState('')
  const { status, reset, proceed } = useBlocker({
    shouldBlockFn: () => draft.length > 0,
    enableBeforeUnload: draft.length > 0,
    withResolver: true,
  })

  return (
    <main>
      <h1>Step {step}</h1>
      <label>
        Draft <input value={draft} onChange={(e) => setDraft(e.target.value)} />
      </label>
      <p>Blocker status: {status}</p>
      {status === 'blocked' && (
        <>
          <button onClick={reset}>Stay here</button>
          <button onClick={proceed}>Leave</button>
        </>
      )}
      <p>
        <Link to="/" search={{ step: step + 1 }}>
          Add history entry
        </Link>{' '}
        {/* A plain fragment link: the browser creates this history entry. */}
        <a href="#fragment">Plain fragment link</a>
      </p>
      <button onClick={() => router.history.back()}>History back</button>
      <button onClick={() => router.history.go(-2)}>History go(-2)</button>
    </main>
  )
}

const rootRoute = createRootRoute({ component: () => <Outlet /> })
const editorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: (search: Record<string, unknown>) => ({
    step: Number(search.step) || 0,
  }),
  component: Editor,
})
const router = createRouter({ routeTree: rootRoute.addChildren([editorRoute]) })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
