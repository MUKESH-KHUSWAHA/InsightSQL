import Sidebar from './Sidebar';

/**
 * Layout — wraps every page.
 * Desktop: sidebar on left, content on right.
 * Mobile: content fills the screen with a top header inside each page.
 */
export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
