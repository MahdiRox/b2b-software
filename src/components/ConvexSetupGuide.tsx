import { Activity, Database, Server, Terminal } from "lucide-react";

export default function ConvexSetupGuide() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-8 text-neutral-900 font-sans">
      <div className="max-w-2xl w-full bg-white border border-neutral-200 rounded-2xl shadow-sm p-10">
        <div className="flex items-center space-x-4 mb-8">
          <div className="bg-orange-500/10 p-3 rounded-xl border border-orange-500/20">
            <Database className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Convex Setup Required
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              Your real-time server-side database needs to be initialized.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-5">
            <h3 className="font-semibold flex items-center text-neutral-800 mb-3">
              <Terminal className="w-4 h-4 mr-2 text-neutral-400" />
              1. Initialize Convex
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              Open your terminal in this workspace and run the following command to deploy your schemas and generate precise TypeScript endpoints.
            </p>
            <pre className="bg-neutral-900 text-neutral-100 font-mono text-sm p-4 rounded-lg overflow-x-auto">
              <code>npx convex dev</code>
            </pre>
          </div>

          <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-5">
            <h3 className="font-semibold flex items-center text-neutral-800 mb-3">
              <Server className="w-4 h-4 mr-2 text-neutral-400" />
              2. Add Environment Variables
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              Once initialized, Convex will provide a live deployment URL. Open the <strong>AI Studio Settings</strong> or your <code className="bg-neutral-200 text-neutral-800 px-1 py-0.5 rounded text-xs">.env</code> and add your key:
            </p>
            <pre className="bg-neutral-900 text-neutral-100 font-mono text-sm p-4 rounded-lg overflow-x-auto">
              <code>VITE_CONVEX_URL="https://your-convex-deployment.convex.cloud"</code>
            </pre>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 text-blue-800 rounded-xl p-5 flex items-start">
            <Activity className="w-5 h-5 mr-3 mt-0.5 text-blue-600 flex-shrink-0" />
            <p className="text-sm mt-0.5">
              The application uses <strong>Convex React</strong> native hooks under the hood. Once your backend is synchronizing, this full-stack portal will instantly go live here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
