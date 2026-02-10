# Google Login Setup Complete! ✅

I have added authentication to your GTM Console workflow.
Your pages (`/jobs-ui`, `/leaders-ui`, `/enriched-ui`) now require login with an `@insightstap.com` or `@sdtcdigital.com` email.

## 🛑 One Final Step Required

To make the "Sign in with Google" button appear, you must add your **Google OAuth Client ID**.

1.  Open your `NewGTM` workflow in n8n.
2.  Find the new node called **Build Auth Page**.
3.  Double-click it to edit the JavaScript code.
4.  Find the text `YOUR_GOOGLE_CLIENT_ID`.
5.  Replace it with your actual Google Client ID (e.g., `123456-abc.apps.googleusercontent.com`).
6.  **Save** and **Activate** (or execute) the workflow.

Once done, visiting `/webhook/jobs-ui` will redirect you to the login page.
