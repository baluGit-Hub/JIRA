
import type { JiraAccessibleResource, JiraBoard, JiraBoardConfiguration, JiraIssue, BoardWithDetails, JiraUser } from '@/types/jira';
import { getAccessToken, getCloudId as getStoredCloudIdFromAuthService, storeCloudId as storeCloudIdInAuthService } from './authService';

const JIRA_API_BASE_URL = 'https://api.atlassian.com';

async function fetchWithAuth(url: string, options: RequestInit = {}, explicitAccessToken?: string): Promise<Response> {
  const accessToken = explicitAccessToken || await getAccessToken();
  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  return fetch(url, { ...options, headers });
}

export async function getAccessibleResources(explicitAccessToken?: string): Promise<JiraAccessibleResource[]> {
  const response = await fetchWithAuth(`${JIRA_API_BASE_URL}/oauth/token/accessible-resources`, {}, explicitAccessToken);
  if (!response.ok) {
    console.error('Failed to fetch accessible resources:', response.status, await response.text());
    throw new Error('Failed to fetch accessible resources');
  }
  return response.json();
}

// Helper to get cloudId, store it if not already stored
export async function getCloudId(explicitAccessToken?: string): Promise<string> {
  // If not using an explicit token for a fresh fetch, try getting stored cloudId first
  if (!explicitAccessToken) {
    const storedCloudId = await getStoredCloudIdFromAuthService();
    if (storedCloudId) {
      return storedCloudId;
    }
  }

  // If explicit token is provided, or if storedCloudId was not found, fetch new.
  const resources = await getAccessibleResources(explicitAccessToken);
  if (resources.length === 0) {
    throw new Error('No accessible JIRA resources found for this user.');
  }
  const cloudIdToStore = resources[0].id;
  // Store it in the session for subsequent requests that don't pass an explicit token
  await storeCloudIdInAuthService(cloudIdToStore);
  return cloudIdToStore;
}

export async function getJiraUser(explicitAccessToken?: string): Promise<JiraUser> {
  const response = await fetchWithAuth(`${JIRA_API_BASE_URL}/me`, {}, explicitAccessToken);
   if (!response.ok) {
    console.error('Failed to fetch user details:', response.status, await response.text());
    throw new Error('Failed to fetch user details');
  }
  return response.json();
}


export async function getBoards(): Promise<JiraBoard[]> {
  const cloudId = await getCloudId(); // Uses session by default
  const response = await fetchWithAuth(`${JIRA_API_BASE_URL}/ex/jira/${cloudId}/rest/agile/1.0/board?maxResults=100`);
  if (!response.ok) {
    console.error('Failed to fetch boards:', response.status, await response.text());
    throw new Error('Failed to fetch boards');
  }
  const data = await response.json();
  return data.values || [];
}

export async function getBoardConfiguration(boardId: number): Promise<JiraBoardConfiguration> {
  const cloudId = await getCloudId(); // Uses session by default
  const response = await fetchWithAuth(`${JIRA_API_BASE_URL}/ex/jira/${cloudId}/rest/agile/1.0/board/${boardId}/configuration`);
  if (!response.ok) {
    console.error(`Failed to fetch configuration for board ${boardId}:`, response.status, await response.text());
    throw new Error(`Failed to fetch configuration for board ${boardId}`);
  }
  return response.json();
}

export async function getBoardIssues(boardId: number): Promise<JiraIssue[]> {
  const cloudId = await getCloudId(); // Uses session by default
  const response = await fetchWithAuth(`${JIRA_API_BASE_URL}/ex/jira/${cloudId}/rest/agile/1.0/board/${boardId}/issue?maxResults=500`);
   if (!response.ok) {
    console.error(`Failed to fetch issues for board ${boardId}:`, response.status, await response.text());
    throw new Error(`Failed to fetch issues for board ${boardId}`);
  }
  const data = await response.json();
  return data.issues || [];
}

export async function getBoardDetailsWithCounts(board: JiraBoard): Promise<BoardWithDetails> {
  try {
    const [config, issues] = await Promise.all([
      getBoardConfiguration(board.id),
      getBoardIssues(board.id),
    ]);

    const statusIdToNameMap = new Map<string, string>();

    const boardColumns = config.columnConfig.columns.map(col => {
      const statusIdsInColumn = col.statuses.map(s => s.id);
      let issueCount = 0;
      issues.forEach(issue => {
        if (statusIdsInColumn.includes(issue.fields.status.id)) {
          issueCount++;
        }
      });
      return {
        name: col.name,
        issueCount: issueCount,
        statuses: statusIdsInColumn,
      };
    });

    return {
      ...board,
      columns: boardColumns,
    };
  } catch (error) {
    console.error(`Error fetching details for board ${board.name} (ID: ${board.id}):`, error);
    return {
      ...board,
      columns: [],
    };
  }
}
