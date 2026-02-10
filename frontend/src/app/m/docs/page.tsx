import MobileStaticPage from '@/components/mobile/MobileStaticPage';

export default function MobileDocsPage() {
  return (
    <MobileStaticPage title="Documentation">
      <section>
        <h2 className="text-sm font-semibold text-white mb-2">Getting Started</h2>
        <p>
          Welcome to WebWorlds! This guide will help you get started with creating and playing games
          on our platform.
        </p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-white mb-2">1. Creating an Account</h3>
        <p className="mb-2">
          To start using WebWorlds, you&apos;ll need to create an account. Click on "Sign Up" and fill
          in your details:
        </p>
        <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
          <li>Username: 3-20 characters, alphanumeric only</li>
          <li>Email: Valid email address</li>
          <li>Password: At least 8 characters with uppercase, lowercase, and numbers</li>
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-white mb-2">2. Creating Your First Game</h3>
        <p>
          Navigate to the "Create" section to open the game editor. You can create interactive games
          using our intuitive visual editor without writing any code.
        </p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-white mb-2">3. Browsing Games</h3>
        <p>
          Visit the "Games" section to browse and play games created by our community. Filter by
          category, view trending games, and discover new favorites.
        </p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-white mb-2">4. Multiplayer Gaming</h3>
        <p>
          WebWorlds supports real-time multiplayer gaming through WebSocket connections. Games can
          host multiple players simultaneously for an enhanced gaming experience.
        </p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-white mb-2">5. Leaderboards</h3>
        <p>
          Compete with other players and track your progress on game-specific leaderboards. Your
          achievements are recorded and displayed on your profile.
        </p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-white mb-2">API Reference</h3>
        <p>
          For developers interested in extending WebWorlds, comprehensive API documentation is
          available. Our REST API allows you to build custom integrations and experiences.
        </p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-white mb-2">Troubleshooting</h3>
        <p>
          Having issues? Contact our support team at{' '}
          <a href="mailto:hello@webworlds.dev" className="text-blue-300">
            hello@webworlds.dev
          </a>
        </p>
      </section>
    </MobileStaticPage>
  );
}
