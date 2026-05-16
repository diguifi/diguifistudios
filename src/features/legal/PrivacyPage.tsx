import { useSeo } from '../../shared/seo';

export function PrivacyPage() {
  useSeo({
    title: 'Privacy Policy',
    description: 'Privacy policy for Diguifi Studios accounts, purchases and website usage.',
    path: '/privacy',
    keywords: ['diguifi privacy policy', 'diguifi studios privacy']
  });

  return (
    <div className="page-stack privacy-page">
      <section className="section-heading">
        <p className="eyebrow">Legal</p>
        <h1>Privacy Policy</h1>
        <p className="privacy-updated">Last updated: May 2025</p>
      </section>

      <div className="privacy-body">
        <section className="privacy-section">
          <h2>Overview</h2>
          <p>
            Diguifi Studios is committed to protecting your privacy. This policy explains what
            information we collect, how we use it, and what rights you have regarding your data.
            We do not run advertising trackers or sell your data to third parties.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Information We Collect</h2>
          <p>
            When you sign in with Google, we receive your <strong>name</strong>,{' '}
            <strong>email address</strong>, and <strong>profile picture</strong> from Google OAuth.
            We also store activity related to your use of the platform, such as purchases and
            order history.
          </p>
          <p>
            We do <strong>not</strong> collect payment information. All payment processing is
            handled securely by Stripe, and we never see or store your card details.
          </p>
        </section>

        <section className="privacy-section">
          <h2>How We Use Your Information</h2>
          <p>Your data is used solely to:</p>
          <ul>
            <li>Authenticate your identity and maintain your session</li>
            <li>Display your name and profile within the platform</li>
            <li>Associate purchases and orders with your account</li>
            <li>Send account-related notifications (e.g. purchase confirmations)</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>Authentication</h2>
          <p>
            We use Google OAuth for authentication. We do not store passwords. A secure session
            token is issued upon login, stored locally in your browser, and used to keep you
            signed in across visits.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Cookies & Storage</h2>
          <p>
            We store a session token in your browser's local storage to maintain your login
            state. No advertising or tracking cookies are used.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Data Sharing</h2>
          <p>
            We do not sell, trade, or share your personal information with third parties, except
            as required to operate the service (e.g. Stripe for payment processing). Stripe's
            privacy policy applies to data processed through their systems.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Your Rights</h2>
          <p>
            You may request deletion of your account and all associated data at any time by
            contacting us at the address below. We will process your request promptly.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. Any changes will be reflected on this
            page with an updated date. Continued use of the platform after changes constitutes
            acceptance of the new policy.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Disclaimer</h2>
          <p>
            All software available for download or purchase on this platform is provided strictly
            for <strong>educational or entertainment purposes</strong>. Diguifi Studios assumes no
            responsibility for any consequences arising from the misuse, modification, or
            redistribution of any software, tool, or digital product offered here. By acquiring
            any product, you agree to use it solely within the bounds of its intended purpose and
            applicable laws.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Contact</h2>
          <p>
            If you have questions or requests regarding your privacy, reach out on Discord:{' '}
            <strong>@diguifi</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
