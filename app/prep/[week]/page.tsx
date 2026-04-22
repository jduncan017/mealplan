import { notFound } from "next/navigation";
import { prep } from "@/data/prep";
import { PrepView } from "@/components/PrepView";

export function generateStaticParams() {
  return prep.map((p) => ({ week: String(p.week) }));
}

export default function PrepPage({ params }: { params: { week: string } }) {
  const weekNum = Number(params.week);
  const week = prep.find((p) => p.week === weekNum);
  if (!week) notFound();
  return <PrepView week={week} allWeeks={prep.map((p) => p.week)} />;
}
