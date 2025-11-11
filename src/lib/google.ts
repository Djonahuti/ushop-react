export function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).google && (window as any).google.accounts?.id) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
}

export function initGoogleSignIn(clientId: string, callback: (credential: string) => void) {
  const google = (window as any).google;
  if (!google?.accounts?.id) return;
  google.accounts.id.initialize({
    client_id: clientId,
    callback: (response: any) => {
      if (response?.credential) callback(response.credential);
    },
  });
}

export function renderGoogleButton(container: HTMLElement) {
  const google = (window as any).google;
  if (!google?.accounts?.id) return;
  google.accounts.id.renderButton(container, {
    theme: 'outline',
    size: 'large',
    shape: 'rectangular',
    text: 'continue_with',
    logo_alignment: 'left',
    width: 320,
  });
}

export function promptGoogleOneTap() {
  const google = (window as any).google;
  if (!google?.accounts?.id) return;
  google.accounts.id.prompt();
}


