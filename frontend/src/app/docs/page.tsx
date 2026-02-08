'use client';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-8">Documentation</h1>
        
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Getting Started</h2>
            <p className="text-slate-300">
              Welcome to WebWorlds! This guide will help you get started with creating and playing games on our platform.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold text-white">1. Creating an Account</h3>
            <p className="text-slate-300">
              To start using WebWorlds, you'll need to create an account. Click on "Sign Up" and fill in your details:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>Username: 3-20 characters, alphanumeric only</li>
              <li>Email: Valid email address</li>
              <li>Password: At least 8 characters with uppercase, lowercase, and numbers</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold text-white">2. Creating Your First Game</h3>
            <p className="text-slate-300">
              Navigate to the "Create" section to open the game editor. You can create interactive games using our 
              intuitive visual editor without writing any code.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold text-white">3. Browsing Games</h3>
            <p className="text-slate-300">
              Visit the "Games" section to browse and play games created by our community. Filter by category, 
              view trending games, and discover new favorites.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold text-white">4. Multiplayer Gaming</h3>
            <p className="text-slate-300">
              WebWorlds supports real-time multiplayer gaming through WebSocket connections. Games can host 
              multiple players simultaneously for an enhanced gaming experience.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold text-white">5. Leaderboards</h3>
            <p className="text-slate-300">
              Compete with other players and track your progress on game-specific leaderboards. Your achievements 
              are recorded and displayed on your profile.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold text-white">API Reference</h3>
            <p className="text-slate-300">
              For developers interested in extending WebWorlds, comprehensive API documentation is available. 
              Our REST API allows you to build custom integrations and experiences.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold text-white">Troubleshooting</h3>
            <p className="text-slate-300">
              Having issues? Check our troubleshooting guide or contact our support team at{' '}
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
