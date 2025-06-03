import type { JiraAccessibleResource, JiraBoard, JiraBoardConfiguration, JiraIssue, BoardWithDetails, JiraUser } from '@/types/jira';
import { getAccessToken, getCloudId as getStoredCloudId, storeCloudId } from './authService';

const JIRA_API_BASE_URL = 'https://api.atlassian.com';

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const accessToken = await getAccessToken();
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

export async function getAccessibleResources(): Promise<JiraAccessibleResource[]> {
  const response = await fetchWithAuth(`${JIRA_API_BASE_URL}/oauth/token/accessible-resources`);
  if (!response.ok) {
    console.error('Failed to fetch accessible resources:', response.status, await response.text());
    throw new Error('Failed to fetch accessible resources');
  }
  return response.json();
}

// Helper to get cloudId, store it if not already stored
export async function getCloudId(): Promise<string> {
  let cloudId = await getStoredCloudId();
  if (cloudId) {
    return cloudId;
  }

  const resources = await getAccessibleResources();
  if (resources.length === 0) {
    throw new Error('No accessible JIRA resources found for this user.');
  }
  // Assuming the first resource is the desired one
  cloudId = resources[0].id;
  await storeCloudId(cloudId);
  return cloudId;
}

export async function getJiraUser(): Promise<JiraUser> {
  const response = await fetchWithAuth(`${JIRA_API_BASE_URL}/me`);
   if (!response.ok) {
    console.error('Failed to fetch user details:', response.status, await response.text());
    throw new Error('Failed to fetch user details');
  }
  return response.json();
}


export async function getBoards(): Promise<JiraBoard[]> {
  const cloudId = await getCloudId();
  const response = await fetchWithAuth(`${JIRA_API_BASE_URL}/ex/jira/${cloudId}/rest/agile/1.0/board?maxResults=100`);
  if (!response.ok) {
    console.error('Failed to fetch boards:', response.status, await response.text());
    throw new Error('Failed to fetch boards');
  }
  const data = await response.json();
  return data.values || [];
}

export async function getBoardConfiguration(boardId: number): Promise<JiraBoardConfiguration> {
  const cloudId = await getCloudId();
  const response = await fetchWithAuth(`${JIRA_API_BASE_URL}/ex/jira/${cloudId}/rest/agile/1.0/board/${boardId}/configuration`);
  if (!response.ok) {
    console.error(`Failed to fetch configuration for board ${boardId}:`, response.status, await response.text());
    throw new Error(`Failed to fetch configuration for board ${boardId}`);
  }
  return response.json();
}

export async function getBoardIssues(boardId: number): Promise<JiraIssue[]> {
  const cloudId = await getCloudId();
  // Fetch all issues, consider pagination for very large boards
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
    // First, populate statusIdToNameMap from all statuses mentioned in config.
    // This might require another API call if status names are not directly in config.
    // /rest/api/3/status endpoint could be used if needed, but let's assume configuration is enough for now.
    // For simplicity, we'll use status IDs directly if names are not easily resolvable from config.
    // Jira Agile API's board configuration doesn't always give status names directly, just IDs.
    // For now, we'll work with column names from config and count issues based on their status ID matching any status ID in a column.

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
        statuses: statusIdsInColumn, // Storing status IDs for now
      };
    });

    return {
      ...board,
      columns: boardColumns,
    };
  } catch (error) {
    console.error(`Error fetching details for board ${board.name} (ID: ${board.id}):`, error);
    // Return board with empty columns on error to avoid breaking the whole page
    return {
      ...board,
      columns: [],
    };
  }
}
