import { createServerClient } from "../../../../lib/supabase/server";
import { getLogsForUser } from "../../../../lib/logs";

export default async function LogPreviewPage() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return <div>Not signed in</div>;
  }
  const logs = getLogsForUser(user.id).map((l) => ({
    ...l,
    requestId: l.requestId.slice(0, 8),
  }));
  return (
    <div>
      <h1>Recent Logs</h1>
      <table>
        <thead>
          <tr>
            <th>Request</th>
            <th>Function</th>
            <th>Duration (ms)</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l, i) => (
            <tr key={i}>
              <td>{l.requestId}</td>
              <td>{l.functionName}</td>
              <td>{l.durationMs}</td>
              <td>{l.result}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
