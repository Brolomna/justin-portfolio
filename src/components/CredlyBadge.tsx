import { useEffect } from 'react';

const SCRIPT_SRC = 'https://cdn.credly.com/assets/utilities/embed.js';

/**
 * Credly "Introduction to Cybersecurity" (Cisco Networking Academy) course
 * completion badge. The embed script scans the DOM for the host div, so the
 * div must render before the script loads — appending it here guarantees that.
 */
export default function CredlyBadge() {
  useEffect(() => {
    if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div
      data-iframe-width="150"
      data-iframe-height="270"
      data-share-badge-id="56dfc04d-df11-4450-b498-1f8be8b4a363"
      data-share-badge-host="https://www.credly.com"
    />
  );
}
