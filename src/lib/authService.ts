import { cookies } from 'next/headers';
import type { IronSession, IronSessionData } from 'iron-session';
import { sealData, unsealData } from 'iron-session';
import { SESSION_SECRET } from '@/config';

const cookieName = 'jira-board-glance-session';
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 7, // 1 week
  path: '/',
};

interface SessionData extends IronSessionData {
  accessToken?: string;
  refreshToken?: string;
  cloudId?: string;
  userId?: string; // Atlassian User ID (accountId)
  userName?: string;
}

async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = cookies();
  const found = cookieStore.get(cookieName);

  if (!found) {
    return {
      // Mock session structure if no cookie found
      get: (key: keyof SessionData) => undefined,
      set: (key: keyof SessionData, value: any) => {},
      destroy: async () => {},
      save: async () => {},
      updateConfig: (config: any) => {},
      // Add any other necessary methods from IronSession
      isSealed: false,
      isDestroyed: false,
    } as unknown as IronSession<SessionData>; // This is a simplification. In a real app with iron-session, this would be handled by the library.
  }

  try {
    const data = await unsealData<SessionData>(found.value, { password: SESSION_SECRET });
    // This is a simplified representation of an IronSession object
    // For a real app using iron-session, you'd use its actual API.
    // This mock is to allow compilation and basic logic flow.
    let sessionData: SessionData = { ...data };

    return {
      get: (key: keyof SessionData) => sessionData[key],
      set: (key: keyof SessionData, value: any) => {
        sessionData = { ...sessionData, [key]: value };
      },
      destroy: async () => {
        sessionData = {} as SessionData; // Clear data
        cookieStore.delete(cookieName);
      },
      save: async () => {
        if (Object.keys(sessionData).length === 0) {
          cookieStore.delete(cookieName);
        } else {
          const sealed = await sealData(sessionData, { password: SESSION_SECRET });
          cookieStore.set(cookieName, sealed, cookieOptions);
        }
      },
      updateConfig: (config: any) => {},
      isSealed: true,
      isDestroyed: false,
      ...sessionData, // Spread initial data
    } as IronSession<SessionData>;
  } catch (error) {
    console.error('Failed to unseal session:', error);
    // If unsealing fails, treat as no session
    return {
      get: (key: keyof SessionData) => undefined,
      set: (key: keyof SessionData, value: any) => {},
      destroy: async () => {},
      save: async () => {},
      updateConfig: (config: any) => {},
      isSealed: false,
      isDestroyed: false,
    } as unknown as IronSession<SessionData>;
  }
}

export async function storeTokens(accessToken: string, refreshToken?: string) {
  const session = await getSession();
  session.set('accessToken', accessToken);
  if (refreshToken) {
    session.set('refreshToken', refreshToken);
  }
  await session.save();
}

export async function storeCloudId(cloudId: string) {
  const session = await getSession();
  session.set('cloudId', cloudId);
  await session.save();
}

export async function storeUserDetails(userId: string, userName: string) {
  const session = await getSession();
  session.set('userId', userId);
  session.set('userName', userName);
  await session.save();
}

export async function getAccessToken(): Promise<string | undefined> {
  const session = await getSession();
  return session.get('accessToken');
}

export async function getCloudId(): Promise<string | undefined> {
  const session = await getSession();
  return session.get('cloudId');
}

export async function getUserDetails(): Promise<{ userId?: string; userName?: string } | undefined> {
  const session = await getSession();
  const userId = session.get('userId');
  const userName = session.get('userName');
  if (userId) {
    return { userId, userName };
  }
  return undefined;
}

export async function clearSession() {
  const session = await getSession();
  await session.destroy();
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAccessToken();
  return !!token;
}
