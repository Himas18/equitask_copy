import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getWeeklyReport } from "@/api";

interface WeeklyReport {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  averageCompletionTime: number;
  teamUtilization: number;
  topPerformers: { name: string; completedTasks: number }[];
}

const WeeklyReportDialog = () => {
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();

  const generateReport = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const { data } = await getWeeklyReport();
      setReport(data);
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;

    const reportContent = `
Weekly Team Report
=================

Summary:
- Total Tasks: ${report.totalTasks}
- Completed Tasks: ${report.completedTasks}
- Overdue Tasks: ${report.overdueTasks}
- Team Utilization: ${report.teamUtilization.toFixed(1)} tasks per member

Top Performers:
${report.topPerformers
  .map((p, i) => `${i + 1}. ${p.name} - ${p.completedTasks} tasks completed`)
  .join("\n")}

Generated on: ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `weekly-report-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (profile?.role !== "lead") {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Weekly Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Weekly Team Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!report ? (
            <div className="text-center py-8">
              <Button onClick={generateReport} disabled={loading}>
                {loading ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{report.totalTasks}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    <CheckCircle className="h-4 w-4 text-success" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-success">{report.completedTasks}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                    <Clock className="h-4 w-4 text-warning" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-warning">{report.overdueTasks}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Utilization</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{report.teamUtilization.toFixed(1)}</div>
                  </CardContent>
                </Card>
              </div>

              {report.topPerformers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {report.topPerformers.map((performer, index) => (
                        <div key={performer.name} className="flex justify-between items-center">
                          <span>
                            {index + 1}. {performer.name}
                          </span>
                          <span className="font-semibold">{performer.completedTasks} tasks</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end">
                <Button onClick={downloadReport} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WeeklyReportDialog;
