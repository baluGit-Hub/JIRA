export interface JiraAccessibleResource {
  id: string; // This is the cloudId
  url: string;
  name: string;
  scopes: string[];
  avatarUrl: string;
}

export interface JiraBoard {
  id: number;
  self: string;
  name: string;
  type: string;
  location?: {
    projectId: number;
    displayName: string;
    projectName: string;
    projectKey: string;
    projectTypeKey: string;
    avatarURI: string;
    name: string;
  };
}

export interface JiraBoardConfiguration {
  id: number;
  name: string;
  columnConfig: {
    columns: JiraColumn[];
    constraintType: string;
  };
}

export interface JiraColumn {
  name: string;
  statuses: JiraStatusReference[];
  min?: number;
  max?: number;
}

export interface JiraStatusReference {
  id: string;
  self: string;
}

export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    status: JiraStatus;
    [key: string]: any; // Other fields
  };
}

export interface JiraStatus {
  id: string;
  name: string;
  statusCategory: JiraStatusCategory;
}

export interface JiraStatusCategory {
  id: number;
  key: string;
  name: string; // e.g., "To Do", "In Progress", "Done"
  colorName: string;
  self: string;
}

export interface BoardWithDetails extends JiraBoard {
  columns: {
    name: string;
    issueCount: number;
    statuses: string[]; // names of statuses mapped to this column
  }[];
}

export interface JiraUser {
  self: string;
  accountId: string;
  accountType: string;
  emailAddress?: string; // May not always be available depending on privacy settings
  avatarUrls: {
    '48x48': string;
    '24x24': string;
    '16x16': string;
    '32x32': string;
  };
  displayName: string;
  active: boolean;
  timeZone?: string;
  locale?: string;
}
