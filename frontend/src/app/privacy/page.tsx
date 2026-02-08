'use client';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-8">Privacy Policy</h1>
        
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 space-y-6 text-slate-300 text-sm">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
            <p>
              WebWorlds ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains 
              how we collect, use, disclose, and safeguard your information when you visit our website and platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
            <p className="mb-2">We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Personal Data:</strong> Name, email address, username, password, and profile information</li>
              <li><strong>Technical Data:</strong> IP address, browser type, and pages visited</li>
              <li><strong>Game Data:</strong> Games created, played, and scores/progress</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Use of Your Information</h2>
            <p className="mb-2">Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Create and manage your account</li>
              <li>Email you regarding your account or order</li>
              <li>Fulfill and send information related to your transaction</li>
              <li>Generate a personal profile about you</li>
              <li>Improve the Site</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures to protect your personal information. 
              However, perfect security does not exist on the Internet.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:hello@webworlds.dev" className="text-blue-400 hover:text-blue-300">
                hello@webworlds.dev
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
