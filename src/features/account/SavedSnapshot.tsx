import { z } from "zod";
export const snapshotSchema = z.object({
  toolId: z.string(),
  engineVersion: z.string(),
  datasetVersion: z.string(),
  score: z.number(),
  symbol: z.string(),
  entertainmentNotice: z.string(),
  sections: z.array(z.object({ title: z.string(), body: z.string() })).min(1),
  lifePath: z.number().optional(),
});
export function SavedSnapshot({ snapshot }: { snapshot: unknown }) {
  const parsed = snapshotSchema.safeParse(snapshot);
  if (!parsed.success)
    return <p>Định dạng của bản lưu này chưa được hỗ trợ.</p>;
  const r = parsed.data;
  return (
    <details>
      <summary>
        {r.sections[0].title} · {r.datasetVersion}
      </summary>
      <p>
        Engine {r.engineVersion} · Dữ liệu {r.datasetVersion}
      </p>
      <p>
        {r.symbol} · {r.score}/100 · điểm biểu tượng
      </p>
      {r.lifePath !== undefined && <p>Số đường đời: {r.lifePath}</p>}
      {r.sections.map((s, i) => (
        <section key={i}>
          <h2>{s.title}</h2>
          <p>{s.body}</p>
        </section>
      ))}
      <p>{r.entertainmentNotice}</p>
    </details>
  );
}
