import { NextResponse } from 'next/server';
import { isAuthenticated, getUserDetails, getCloudId } from '@/lib/authService';

export async function GET() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ isAuthenticated: false }, { status: 200 });
  }

  try {
    const user = await getUserDetails(); // This should ideally fetch from Atlassian if not stored
    const cloudId = await getCloudId(); // Get stored cloudId

    if (user && user.userId) {
      return NextResponse.json({ 
        isAuthenticated: true, 
        user: { 
          id: user.userId, 
          name: user.userName, 
          // In a real app, you might fetch avatar URL here or have it stored
        },
        cloudId: cloudId 
      });
    } else {
      // This case might happen if tokens are there but user details were not fetched/stored properly.
      // For robustness, one might try to re-fetch user details from JIRA here if session is partial.
      return NextResponse.json({ isAuthenticated: true, user: null, cloudId: cloudId });
    }
  } catch (error) {
    console.error("Error fetching user status:", error);
    return NextResponse.json({ isAuthenticated: false, error: "Failed to retrieve user status" }, { status: 500 });
  }
}
