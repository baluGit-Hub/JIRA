import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo, Loader2, CheckCircle, HelpCircle } from "lucide-react"; // Using HelpCircle for unknown/default

interface ColumnDisplayProps {
  name: string;
  issueCount: number;
}

// Helper to pick an icon based on common column names
const getIconForColumn = (columnName: string) => {
  const lowerColName = columnName.toLowerCase();
  if (lowerColName.includes("to do") || lowerColName.includes("open") || lowerColName.includes("backlog")) {
    return <ListTodo className="h-5 w-5 text-muted-foreground" />;
  }
  if (lowerColName.includes("in progress") || lowerColName.includes("development") || lowerColName.includes("review")) {
    return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
  }
  if (lowerColName.includes("done") || lowerColName.includes("closed") || lowerColName.includes("resolved")) {
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  }
  return <HelpCircle className="h-5 w-5 text-muted-foreground" />;
};


export default function ColumnDisplay({ name, issueCount }: ColumnDisplayProps) {
  return (
    <Card className="min-w-[200px] w-full sm:w-auto flex-shrink-0 bg-secondary/50 shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-secondary-foreground truncate" title={name}>
            {name}
          </CardTitle>
          {getIconForColumn(name)}
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <p className="text-3xl font-bold text-foreground">{issueCount}</p>
        <p className="text-xs text-muted-foreground">
          {issueCount === 1 ? "issue" : "issues"}
        </p>
      </CardContent>
    </Card>
  );
}
