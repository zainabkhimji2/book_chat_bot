/**
 * Docusaurus Root Component
 * 
 * This component wraps the entire site with the AnalyticsTracker,
 * enabling automatic tracking of user interactions (page views, scroll depth, etc.)
 * 
 * GA4 is configured via the GA4_MEASUREMENT_ID environment variable.
 * If not set, analytics will not load.
 */

import React from 'react';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import AIChatbot from '@site/src/components/AIChatbot'; // Import the AIChatbot component
import BrowserOnly from '@docusaurus/BrowserOnly'; // Import BrowserOnly

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <AnalyticsTracker>
      {children}
      <BrowserOnly>
        {() => (
          <>
            <AIChatbot /> {/* Render the AIChatbot component */}
          </>
        )}
      </BrowserOnly>
    </AnalyticsTracker>
  );
}
