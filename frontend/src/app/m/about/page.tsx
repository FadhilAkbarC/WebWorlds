import MobileStaticPage from '@/components/mobile/MobileStaticPage';

export default function MobileAboutPage() {
  return (
    <MobileStaticPage title="About WebWorlds">
      <section>
        <h2 className="text-sm font-semibold text-white mb-2">What is WebWorlds?</h2>
        <p>
          WebWorlds is a lightweight, innovative web-based gaming platform that empowers creators and
          gamers alike. Our mission is to make game development accessible to everyone by providing
          intuitive tools for creating and sharing unique gaming experiences.
        </p>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-white mb-2">Our Vision</h2>
        <p>
          We believe that creativity should have no boundaries. By democratizing game development
          through an accessible web platform, we&apos;re building a vibrant community where anyone can
          create, share, and play innovative games without requiring extensive programming knowledge.
        </p>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-white mb-2">Features</h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
          <li>Easy-to-use game editor with drag-and-drop functionality</li>
          <li>Real-time multiplayer gaming capabilities</li>
          <li>Comprehensive game library with trending games</li>
          <li>Community-driven platform for sharing and discovering games</li>
          <li>No installation required - play directly from your browser</li>
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-white mb-2">Contact Us</h2>
        <p>
          Have questions or feedback? We&apos;d love to hear from you at{' '}
          <a href="mailto:hello@webworlds.dev" className="text-blue-300">
            hello@webworlds.dev
          </a>
        </p>
      </section>
    </MobileStaticPage>
  );
}


