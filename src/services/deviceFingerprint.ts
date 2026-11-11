/**
 * Client Device Fingerprint & Token Generator
 * Follows BCA Study Point Device Policy:
 * 1 Student Account = 1 Registered Device = 1 Active Session
 */

const DEVICE_STORAGE_KEY = 'bca_student_device_token_v1';

export interface DeviceInfo {
  token: string;
  userAgent: string;
  os: string;
  browser: string;
  screenResolution: string;
}

export function getOrCreateDeviceToken(): DeviceInfo {
  let token = localStorage.getItem(DEVICE_STORAGE_KEY);
  if (!token) {
    const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    token = `dev_${Date.now()}_${randomBytes}`;
    localStorage.setItem(DEVICE_STORAGE_KEY, token);
  }

  const userAgent = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || (typeof window !== 'undefined' && window.innerWidth < 768);

  let os = 'Unknown OS';
  if (userAgent.indexOf('Win') !== -1) os = 'Windows Desktop';
  else if (userAgent.indexOf('Mac') !== -1) os = isMobile ? 'iPad / iOS' : 'Mac Desktop';
  else if (userAgent.indexOf('Android') !== -1) os = 'Mobile Android';
  else if (userAgent.indexOf('iPhone') !== -1) os = 'Mobile iPhone';
  else if (userAgent.indexOf('iPad') !== -1) os = 'Tablet iPad';
  else if (userAgent.indexOf('Linux') !== -1) os = isMobile ? 'Mobile Linux' : 'Linux PC';

  let browser = 'Browser';
  if (userAgent.indexOf('Firefox') !== -1) browser = 'Firefox';
  else if (userAgent.indexOf('SamsungBrowser') !== -1) browser = 'Samsung Internet';
  else if (userAgent.indexOf('Opera') !== -1 || userAgent.indexOf('OPR') !== -1) browser = 'Opera';
  else if (userAgent.indexOf('Edge') !== -1 || userAgent.indexOf('Edg') !== -1) browser = 'Edge';
  else if (userAgent.indexOf('Chrome') !== -1) browser = isMobile ? 'Mobile Chrome' : 'Desktop Chrome';
  else if (userAgent.indexOf('Safari') !== -1) browser = isMobile ? 'Mobile Safari' : 'Desktop Safari';

  const screenResolution = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '1920x1080';

  return {
    token,
    userAgent: `${isMobile ? 'Mobile' : 'Desktop'} · ${browser} on ${os}`,
    os: `${isMobile ? '📱 Mobile' : '💻 Desktop'}: ${os}`,
    browser,
    screenResolution,
  };
}

/**
 * Helper to simulate device switching for testing verification if needed
 */
export function simulateNewDevice(): DeviceInfo {
  const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const token = `dev_alt_${Date.now()}_${randomBytes}`;
  localStorage.setItem(DEVICE_STORAGE_KEY, token);
  return getOrCreateDeviceToken();
}
