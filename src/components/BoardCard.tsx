import type { BoardWithDetails } from "@/types/jira";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ColumnDisplay from "./ColumnDisplay";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { LayoutGrid } from "lucide-react";

interface BoardCardProps {
  board: BoardWithDetails;
}

export default function BoardCard({ board }: BoardCardProps) {
  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <LayoutGrid className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
          <div>
            <CardTitle className="text-xl font-headline">{board.name}</CardTitle>
            <CardDescription className="text-sm">
              {board.type} board {board.location ? `in ${board.location.projectName}` : ''}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        {board.columns && board.columns.length > 0 ? (
          <ScrollArea className="w-full whitespace-nowrap rounded-md">
            <div className="flex space-x-4 pb-4">
              {board.columns.map((column) => (
                <ColumnDisplay
                  key={column.name}
                  name={column.name}
                  issueCount={column.issueCount}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">No column data available or board is empty.</p>
        )}
      </CardContent>
    </Card>
  );
}
