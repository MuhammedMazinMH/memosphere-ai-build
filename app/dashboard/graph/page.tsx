import type { Metadata } from "next"
import { KnowledgeGraphView } from "@/components/dashboard/knowledge-graph-view"

export const metadata: Metadata = {
  title: "Knowledge Graph",
}

export default function GraphPage() {
  return <KnowledgeGraphView />
}
