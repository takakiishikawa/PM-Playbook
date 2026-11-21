import BookWithBookmarkIcon from "@atlaskit/icon/core/book-with-bookmark";
import BriefcaseIcon from "@atlaskit/icon/core/briefcase";
import RoadmapIcon from "@atlaskit/icon/core/roadmap";
import CompassIcon from "@atlaskit/icon/core/compass";
import LightbulbIcon from "@atlaskit/icon/core/lightbulb";
import ToolsIcon from "@atlaskit/icon/core/tools";
import ChartBarIcon from "@atlaskit/icon/core/chart-bar";
import TimelineIcon from "@atlaskit/icon/core/timeline";
import ShieldIcon from "@atlaskit/icon/core/shield";
import AiSparkleIcon from "@atlaskit/icon/core/ai-sparkle";
import { Icon, type Glyph } from "./icon";

/** 領域ごとのアイコン。一覧で領域を見分けやすくするためのもの */
const DOMAIN_GLYPHS: Record<string, Glyph> = {
  foundation: BookWithBookmarkIcon,
  bizdev: BriefcaseIcon,
  strategy: RoadmapIcon,
  discovery: CompassIcon,
  solution: LightbulbIcon,
  build: ToolsIcon,
  analytics: ChartBarIcon,
  project: TimelineIcon,
  security: ShieldIcon,
  ai: AiSparkleIcon,
};

export function DomainIcon({ slug, color = "var(--color-text-subtle)" }: { slug: string; color?: string }) {
  const g = DOMAIN_GLYPHS[slug];
  return g ? <Icon glyph={g} color={color} /> : null;
}
