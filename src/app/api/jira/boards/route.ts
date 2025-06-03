import { NextResponse } from 'next/server';
import { getBoards, getBoardDetailsWithCounts } from '@/lib/jiraService';
import { isAuthenticated } from '@/lib/authService';
import type { BoardWithDetails } from '@/types/jira';

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const boards = await getBoards();
    
    // Fetch details for all boards concurrently
    const boardsWithDetailsPromises = boards.map(board => getBoardDetailsWithCounts(board));
    const boardsWithDetails: BoardWithDetails[] = await Promise.all(boardsWithDetailsPromises);

    return NextResponse.json(boardsWithDetails);
  } catch (error) {
    console.error('Failed to fetch boards with details:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch JIRA boards', details: errorMessage }, { status: 500 });
  }
}
