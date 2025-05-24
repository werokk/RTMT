import React from 'react';

function DummyApp() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Case Management System</h1>
      <p className="mb-4">
        We're experiencing some technical difficulties with the full application.
        Please check back later or contact support.
      </p>
      <div className="p-4 border rounded bg-blue-50">
        <h2 className="font-bold mb-2">System Status</h2>
        <ul className="list-disc pl-5">
          <li>Server: Running</li>
          <li>Database Connection: Active</li>
          <li>Frontend UI: Loading Error</li>
        </ul>
      </div>
    </div>
  );
}

export default DummyApp;