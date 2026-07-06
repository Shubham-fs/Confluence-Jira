import type { ElementType } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import BiotechIcon from '@mui/icons-material/Biotech';
import BoltIcon from '@mui/icons-material/Bolt';
import CodeIcon from '@mui/icons-material/Code';
import DataObjectIcon from '@mui/icons-material/DataObject';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import HubIcon from '@mui/icons-material/Hub';
import InsightsIcon from '@mui/icons-material/Insights';
import PsychologyIcon from '@mui/icons-material/Psychology';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import RuleIcon from '@mui/icons-material/Rule';
import SecurityIcon from '@mui/icons-material/Security';
import StorageIcon from '@mui/icons-material/Storage';
import TerminalIcon from '@mui/icons-material/Terminal';
import VerifiedIcon from '@mui/icons-material/Verified';

type IconCard = {
  title: string;
  body: string;
  icon: ElementType;
  accent?: string;
};

type ImageAsset = {
  title: string;
  caption: string;
  src: string;
  alt: string;
};

const nav = [
  'Intro',
  'Problem',
  'Solution',
  'Architecture',
  'SOLID',
  'Copilot',
  'Clean Code',
  'Critical Thinking',
  'Scaling',
  'Monetization',
  'Learnings',
  'Thank You',
];

const metrics = [
  { value: '3', label: 'core report modes' },
  { value: '100%', label: 'Jira-backed history' },
  { value: '0', label: 'local history copies' },
  { value: 'AI + JQL', label: 'transparent search' },
];

const images = {
  hero: {
    title: 'Executive engineering intelligence',
    caption: 'A product-style dashboard story for Jira, Confluence, and AI-assisted reporting.',
    src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=85',
    alt: 'Dark analytics dashboard with charts on a monitor',
  },
  team: {
    title: 'Teams from Confluence',
    caption: 'Team membership becomes structured report input instead of manual tracking.',
    src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=85',
    alt: 'Team collaborating in front of a planning board',
  },
  jira: {
    title: 'Jira as source of truth',
    caption: 'JQL and changelog history keep reporting grounded in real workflow data.',
    src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85',
    alt: 'Laptop showing software workflow and code',
  },
  ai: {
    title: 'Groq-powered query planning',
    caption: 'Natural language becomes visible, scoped, executable Jira Query Language.',
    src: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=85',
    alt: 'Abstract artificial intelligence visualization',
  },
  architecture: {
    title: 'Integration architecture',
    caption: 'Frontend, FastAPI, Atlassian APIs, and Groq connected through clean service boundaries.',
    src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=85',
    alt: 'Circuit board representing connected system architecture',
  },
  copilot: {
    title: 'AI-assisted engineering',
    caption: 'Copilot accelerated iteration while engineering review preserved correctness.',
    src: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=85',
    alt: 'Developer workstation with code on screens',
  },
  scale: {
    title: 'Scale into a reporting platform',
    caption: 'From one project dashboard to multi-project analytics and automated leadership reporting.',
    src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=85',
    alt: 'Business analytics charts on laptop',
  },
  money: {
    title: 'Commercial packaging',
    caption: 'A Jira Marketplace or SaaS product for teams that need automated engineering visibility.',
    src: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=85',
    alt: 'Financial planning documents and calculator',
  },
  gratitude: {
    title: 'Built with guidance',
    caption: 'A closing moment for the mentors, reviewers, and learning journey behind the project.',
    src: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=85',
    alt: 'Professional team gathered around a table',
  },
} satisfies Record<string, ImageAsset>;

const problemCards: IconCard[] = [
  {
    title: 'Scattered activity data',
    body: 'Teams live in Confluence, work lives in Jira, and history lives inside changelogs.',
    icon: HubIcon,
    accent: '#38bdf8',
  },
  {
    title: 'Current state hides history',
    body: 'Jira fields show the latest assignee/status, not who owned or moved the ticket earlier.',
    icon: StorageIcon,
    accent: '#f59e0b',
  },
  {
    title: 'Manual reports are fragile',
    body: 'Managers lose time collecting screenshots, checking ticket history, and reconciling data.',
    icon: RuleIcon,
    accent: '#34d399',
  },
];

const solutionCards: IconCard[] = [
  {
    title: 'Assigned Issues',
    body: 'Uses Jira JQL history with assignee WAS "accountId" to show all tickets ever associated with a person.',
    icon: VerifiedIcon,
  },
  {
    title: 'Transitions',
    body: 'Replays Jira changelogs to detect one-step forward moves and preserve Build -> Pending QA as a filter.',
    icon: AutoGraphIcon,
  },
  {
    title: 'Advanced AI Search',
    body: 'Groq plans natural-language prompts into structured intent and visible executed JQL.',
    icon: PsychologyIcon,
  },
  {
    title: 'Excel Export',
    body: 'Backend regenerates report data and exports clean workbooks for leadership reviews.',
    icon: DownloadDoneIcon,
  },
];

const solid = [
  ['S', 'Single Responsibility', 'JiraClient, ConfluenceClient, ReportService, AiQueryService, and ExcelService each own one focused concern.'],
  ['O', 'Open/Closed', 'Workflow statuses and transition filters are configurable, so Build -> Pending QA became one option in a broader engine.'],
  ['L', 'Liskov Substitution', 'Service contracts and protocols make fake clients/LLMs usable in tests without changing orchestration code.'],
  ['I', 'Interface Segregation', 'Small clients and services replace a single oversized integration class.'],
  ['D', 'Dependency Inversion', 'Routers depend on injected services; AI planning depends on abstract LLM/member-directory behavior.'],
];

const thinking: IconCard[] = [
  {
    title: 'History needed more than fields',
    body: 'We used changelog replay because current Jira fields cannot answer who moved what and who owned it then.',
    icon: BiotechIcon,
  },
  {
    title: 'AI made auditable',
    body: 'The UI shows executed JQL, and the backend enforces project scope before Jira sees any query.',
    icon: SecurityIcon,
  },
  {
    title: 'Business meaning separated',
    body: 'Assignee and actor are different questions, so the report supports both instead of mixing them.',
    icon: InsightsIcon,
  },
  {
    title: 'Real API behavior handled',
    body: 'Name resolution falls back to the Jira user directory when query-based user search returns empty.',
    icon: TerminalIcon,
  },
];

const roadmap = [
  'Multi-project analytics',
  'Scheduled executive reports',
  'Slack / Teams delivery',
  'Custom workflow mapping',
  'Bottleneck and workload AI insights',
  'SSO, RBAC, and audit logs',
];

const pricing = [
  {
    plan: 'Starter',
    price: '₹999 / team / month',
    points: ['Small teams', 'Assigned + transitions', 'Excel export'],
  },
  {
    plan: 'Professional',
    price: '₹2,999 / org / month',
    points: ['AI search', 'Scheduled reporting', 'Multi-project dashboard'],
    featured: true,
  },
  {
    plan: 'Enterprise',
    price: 'Custom',
    points: ['SSO + RBAC', 'Audit logs', 'Custom workflows + support'],
  },
];

const learnings = [
  'Jira JQL and changelog history',
  'Confluence data parsing',
  'FastAPI service architecture',
  'React dashboard engineering',
  'Groq LLM integration',
  'Prompt engineering with validation',
  'Clean code and SOLID principles',
  'Secure API key handling',
];

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box component="section" id={id} sx={sectionSx}>
      <Typography sx={eyebrowSx}>{eyebrow}</Typography>
      <Typography variant="h2" sx={sectionTitleSx}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function FeatureCard({ item }: { item: IconCard }) {
  const Icon = item.icon;
  return (
    <Box sx={cardSx}>
      <Box sx={{ ...iconBoxSx, color: item.accent ?? '#67e8f9' }}>
        <Icon fontSize="small" />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 800, color: '#f8fafc' }}>
        {item.title}
      </Typography>
      <Typography sx={bodySx}>{item.body}</Typography>
    </Box>
  );
}

function FlowNode({ label, detail }: { label: string; detail: string }) {
  return (
    <Box sx={flowNodeSx}>
      <Typography sx={{ fontWeight: 900, color: '#f8fafc' }}>{label}</Typography>
      <Typography sx={{ color: '#a7b4ca', fontSize: 14 }}>{detail}</Typography>
    </Box>
  );
}

function ImagePanel({ asset, tall = false }: { asset: ImageAsset; tall?: boolean }) {
  return (
    <Box sx={{ ...imagePanelSx, minHeight: tall ? { xs: 360, md: 520 } : { xs: 260, md: 340 } }}>
      <Box component="img" src={asset.src} alt={asset.alt} loading="lazy" sx={imageSx} />
      <Box sx={imageOverlaySx} />
      <Box sx={imageCaptionSx}>
        <Typography sx={{ color: '#f8fafc', fontWeight: 950, fontSize: { xs: 20, md: 26 } }}>
          {asset.title}
        </Typography>
        <Typography sx={{ color: '#cbd5e1', lineHeight: 1.6 }}>{asset.caption}</Typography>
      </Box>
    </Box>
  );
}

function ImageRibbon({ assets }: { assets: ImageAsset[] }) {
  return (
    <Box sx={imageRibbonSx}>
      {assets.map((asset) => (
        <ImagePanel key={asset.title} asset={asset} />
      ))}
    </Box>
  );
}

export default function PresentationPage() {
  return (
    <Box sx={pageSx}>
      <Box sx={ambientSx} />
      <Box sx={progressNavSx}>
        {nav.map((item) => (
          <Button key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} sx={navButtonSx}>
            {item}
          </Button>
        ))}
      </Box>

      <Box component="section" id="intro" sx={heroSx}>
        <Stack direction="row" spacing={1.2} flexWrap="wrap" useFlexGap>
          <Chip label="Jira Cloud" sx={chipSx} />
          <Chip label="Confluence Cloud" sx={chipSx} />
          <Chip label="Groq AI" sx={chipSx} />
          <Chip label="FastAPI + React" sx={chipSx} />
        </Stack>
        <Typography variant="h1" sx={heroTitleSx}>
          Developer Activity Reporting Dashboard
        </Typography>
        <Typography sx={heroBodySx}>
          A premium engineering intelligence layer for Jira and Confluence: live
          historical reporting, transparent AI-powered JQL, workflow transition
          analytics, and executive-ready exports.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
          <Button href="#architecture" variant="contained" sx={primaryButtonSx}>
            View Architecture
          </Button>
          <Button href="#monetization" variant="outlined" sx={outlineButtonSx}>
            Commercial Potential
          </Button>
        </Stack>
        <Box sx={heroImageSx}>
          <ImagePanel asset={images.hero} tall />
          <Stack spacing={2}>
            <ImagePanel asset={images.ai} />
            <ImagePanel asset={images.team} />
          </Stack>
        </Box>
        <Box sx={metricsGridSx}>
          {metrics.map((metric) => (
            <Box key={metric.label} sx={metricSx}>
              <Typography sx={{ fontSize: { xs: 28, md: 40 }, fontWeight: 900 }}>
                {metric.value}
              </Typography>
              <Typography sx={{ color: '#8ea0ba', fontSize: 13, textTransform: 'uppercase' }}>
                {metric.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Section id="problem" eyebrow="01 / Problem Statement" title="Reporting work should not require detective work.">
        <Typography sx={leadSx}>
          Activity data is real, but it is distributed across tools and hidden in history. The project turns that fragmented trail into a clear, leadership-ready view.
        </Typography>
        <Box sx={grid3Sx}>{problemCards.map((item) => <FeatureCard key={item.title} item={item} />)}</Box>
        <ImageRibbon assets={[images.team, images.jira, images.architecture]} />
      </Section>

      <Section id="solution" eyebrow="02 / Solution" title="One dashboard for team, issue, transition, and AI insight.">
        <Box sx={grid4Sx}>{solutionCards.map((item) => <FeatureCard key={item.title} item={item} />)}</Box>
        <Box sx={jqlCardSx}>
          <Typography sx={{ color: '#67e8f9', fontWeight: 800 }}>Transparent JQL Example</Typography>
          <Typography component="pre" sx={codeSx}>{'project = KAN AND assignee WAS "712020:..." ORDER BY updated DESC'}</Typography>
          <Typography sx={bodySx}>The user can ask in natural language, but the system still exposes the concrete Jira query.</Typography>
        </Box>
        <ImageRibbon assets={[images.ai, images.jira, images.scale]} />
      </Section>

      <Section id="architecture" eyebrow="03 / Architecture + Methodology + Demo" title="A clean integration spine with auditable AI.">
        <Box sx={{ mt: 4 }}>
          <ImagePanel asset={images.architecture} tall />
        </Box>
        <Box sx={architectureSx}>
          <FlowNode label="React Dashboard" detail="Team, member, date filters, reports, AI panel" />
          <Box sx={arrowSx}>{'->'}</Box>
          <FlowNode label="FastAPI Backend" detail="Routers, services, schemas, dependency injection" />
          <Box sx={arrowSx}>{'->'}</Box>
          <Stack spacing={1.5} sx={{ minWidth: 220 }}>
            <FlowNode label="Confluence API" detail="Team membership" />
            <FlowNode label="Jira API" detail="JQL + changelog" />
            <FlowNode label="Groq API" detail="AI query planning" />
          </Stack>
        </Box>
        <Box sx={demoTimelineSx}>
          {['Select team', 'Generate reports', 'Filter Build -> Pending QA', 'Run AI Search', 'Show executed JQL', 'Export Excel'].map((step, index) => (
            <Box key={step} sx={timelineItemSx}>
              <Typography sx={{ color: '#67e8f9', fontWeight: 900 }}>0{index + 1}</Typography>
              <Typography sx={{ color: '#f8fafc', fontWeight: 800 }}>{step}</Typography>
            </Box>
          ))}
        </Box>
      </Section>

      <Section id="solid" eyebrow="04 / SOLID Principles" title="Where we applied strong engineering design.">
        <Box sx={solidGridSx}>
          {solid.map(([letter, name, detail]) => (
            <Box key={letter} sx={solidCardSx}>
              <Typography sx={solidLetterSx}>{letter}</Typography>
              <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 900 }}>{name}</Typography>
              <Typography sx={bodySx}>{detail}</Typography>
            </Box>
          ))}
        </Box>
      </Section>

      <Section id="copilot" eyebrow="05 / GitHub Copilot Usage" title="Copilot accelerated the build, engineering judgment shaped it.">
        <Box sx={splitSx}>
          <Box sx={cardSx}>
            <BoltIcon sx={{ color: '#facc15', fontSize: 42 }} />
            <Typography variant="h5" sx={{ color: '#f8fafc', fontWeight: 900, mt: 2 }}>Acceleration</Typography>
            <Typography sx={bodySx}>Copilot helped with full-stack implementation, refactors, tests, documentation, and rapid iteration from the old NLQ concept to Groq-backed Advanced AI Search.</Typography>
          </Box>
          <Box sx={cardSx}>
            <VerifiedIcon sx={{ color: '#34d399', fontSize: 42 }} />
            <Typography variant="h5" sx={{ color: '#f8fafc', fontWeight: 900, mt: 2 }}>Judgment</Typography>
            <Typography sx={bodySx}>Architecture decisions, validation, debugging, API behavior analysis, and security boundaries were reviewed and controlled by us.</Typography>
          </Box>
          <ImagePanel asset={images.copilot} />
        </Box>
      </Section>

      <Section id="clean-code" eyebrow="06 / Clean Code" title="Readable, testable, and safe by construction.">
        <Box sx={grid3Sx}>
          {[
            ['Typed contracts', 'Pydantic schemas and TypeScript interfaces keep frontend/backend data aligned.'],
            ['Focused services', 'Report, AI, team, client, and export responsibilities are separated.'],
            ['Config driven', 'Workflow statuses, CORS, project key, and model settings come from environment config.'],
            ['Transparent errors', 'Groq and Atlassian failures become controlled API responses.'],
            ['No secrets in UI', 'The browser only sees backend URLs, never API keys or tokens.'],
            ['Validation culture', 'Backend tests and frontend type-checking protect the core flows.'],
          ].map(([title, body]) => (
            <Box key={title} sx={miniCardSx}>
              <CodeIcon sx={{ color: '#67e8f9' }} />
              <Typography sx={{ color: '#f8fafc', fontWeight: 900 }}>{title}</Typography>
              <Typography sx={bodySx}>{body}</Typography>
            </Box>
          ))}
        </Box>
      </Section>

      <Section id="critical-thinking" eyebrow="07 / Critical Thinking Applied" title="The important choices were about truth, safety, and meaning.">
        <Box sx={grid4Sx}>{thinking.map((item) => <FeatureCard key={item.title} item={item} />)}</Box>
      </Section>

      <Section id="scaling" eyebrow="08 / Future Implications + Scaling" title="From project dashboard to engineering intelligence platform.">
        <ImageRibbon assets={[images.scale, images.architecture, images.ai]} />
        <Box sx={roadmapSx}>
          {roadmap.map((item, index) => (
            <Box key={item} sx={roadmapItemSx}>
              <Box sx={roadmapDotSx}>{index + 1}</Box>
              <Typography sx={{ color: '#f8fafc', fontWeight: 800 }}>{item}</Typography>
            </Box>
          ))}
        </Box>
      </Section>

      <Section id="monetization" eyebrow="09 / Commercial Potential" title="A product that saves management time can become a SaaS business.">
        <Typography sx={leadSx}>Target users: engineering managers, scrum masters, delivery heads, QA leads, and software teams using Jira + Confluence.</Typography>
        <Box sx={{ mt: 2, mb: 2 }}>
          <ImagePanel asset={images.money} tall />
        </Box>
        <Box sx={pricingGridSx}>
          {pricing.map((plan) => (
            <Box key={plan.plan} sx={{ ...pricingCardSx, ...(plan.featured ? featuredPricingSx : {}) }}>
              <Typography sx={{ color: plan.featured ? '#020617' : '#67e8f9', fontWeight: 900, letterSpacing: 1 }}>{plan.plan}</Typography>
              <Typography variant="h4" sx={{ color: plan.featured ? '#020617' : '#f8fafc', fontWeight: 950, my: 2 }}>{plan.price}</Typography>
              <Stack spacing={1.2}>{plan.points.map((point) => <Typography key={point} sx={{ color: plan.featured ? '#1e293b' : '#b8c4d8' }}>• {point}</Typography>)}</Stack>
            </Box>
          ))}
        </Box>
      </Section>

      <Section id="learnings" eyebrow="10 / What We Have Learnt" title="This project connected classroom principles with enterprise engineering.">
        <Box sx={learningGridSx}>
          {learnings.map((item) => (
            <Box key={item} sx={learningPillSx}>
              <DataObjectIcon sx={{ color: '#34d399', fontSize: 18 }} />
              <Typography sx={{ color: '#dbeafe', fontWeight: 700 }}>{item}</Typography>
            </Box>
          ))}
        </Box>
      </Section>

      <Box component="section" id="thank-you" sx={thanksSx}>
        <Box sx={{ width: 'min(900px, 100%)', mb: 4 }}>
          <ImagePanel asset={images.gratitude} />
        </Box>
        <RocketLaunchIcon sx={{ fontSize: 58, color: '#67e8f9' }} />
        <Typography variant="h2" sx={sectionTitleSx}>Thank You</Typography>
        <Typography sx={heroBodySx}>Thank you sir for teaching us, guiding us, and giving us the opportunity to build and present this project.</Typography>
        <Divider sx={{ borderColor: 'rgba(148,163,184,.25)', my: 4, width: '100%' }} />
        <Typography sx={{ color: '#dbeafe', fontSize: { xs: 18, md: 24 }, maxWidth: 900, textAlign: 'center' }}>
          This project helped us understand how real enterprise tools combine APIs, automation, AI, clean code, and critical engineering decisions.
        </Typography>
      </Box>
    </Box>
  );
}

const pageSx = {
  position: 'relative',
  overflow: 'hidden',
  minHeight: '100vh',
  mx: { xs: -2, md: -4 },
  mt: { xs: -2, md: -4 },
  mb: { xs: -2, md: -4 },
  px: { xs: 2.5, md: 5 },
  pb: 8,
  color: '#e5edf7',
  background:
    'radial-gradient(circle at 18% 6%, rgba(14,165,233,.24), transparent 32%), radial-gradient(circle at 82% 18%, rgba(16,185,129,.20), transparent 28%), linear-gradient(145deg, #020617 0%, #08111f 45%, #0b1120 100%)',
};

const ambientSx = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  opacity: 0.62,
  backgroundImage:
    'linear-gradient(rgba(148,163,184,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.055) 1px, transparent 1px)',
  backgroundSize: '54px 54px',
  maskImage: 'linear-gradient(to bottom, black, transparent 85%)',
};

const progressNavSx = {
  position: 'sticky',
  top: 76,
  zIndex: 3,
  display: { xs: 'none', lg: 'flex' },
  gap: 0.5,
  justifyContent: 'center',
  flexWrap: 'wrap',
  py: 1.2,
  mb: 2,
  border: '1px solid rgba(148,163,184,.16)',
  borderRadius: 999,
  backgroundColor: 'rgba(2,6,23,.72)',
  backdropFilter: 'blur(18px)',
};

const navButtonSx = {
  minWidth: 'auto',
  px: 1.4,
  py: 0.65,
  color: '#c7d2fe',
  fontSize: 12,
  fontWeight: 800,
  borderRadius: 999,
  '&:hover': { backgroundColor: 'rgba(103,232,249,.12)', color: '#fff' },
};

const heroSx = {
  position: 'relative',
  minHeight: { xs: 'calc(100vh - 120px)', md: 'calc(100vh - 96px)' },
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  maxWidth: 1220,
  mx: 'auto',
  py: { xs: 8, md: 12 },
};

const heroTitleSx = {
  color: '#f8fafc',
  fontSize: { xs: 48, sm: 68, md: 92 },
  lineHeight: 0.92,
  fontWeight: 950,
  letterSpacing: 0,
  maxWidth: 1050,
  mt: 3,
};

const heroBodySx = {
  color: '#bdd0e9',
  fontSize: { xs: 18, md: 23 },
  lineHeight: 1.65,
  maxWidth: 860,
};

const chipSx = {
  color: '#cffafe',
  borderColor: 'rgba(103,232,249,.28)',
  backgroundColor: 'rgba(8,47,73,.45)',
  border: '1px solid rgba(103,232,249,.22)',
  fontWeight: 800,
};

const primaryButtonSx = {
  px: 3,
  py: 1.35,
  borderRadius: 999,
  color: '#04111f',
  fontWeight: 900,
  background: 'linear-gradient(135deg, #67e8f9, #34d399)',
  '&:hover': { background: 'linear-gradient(135deg, #22d3ee, #10b981)' },
};

const outlineButtonSx = {
  px: 3,
  py: 1.35,
  borderRadius: 999,
  color: '#dbeafe',
  borderColor: 'rgba(219,234,254,.35)',
  fontWeight: 900,
  '&:hover': { borderColor: '#67e8f9', backgroundColor: 'rgba(103,232,249,.08)' },
};

const metricsGridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
  gap: 1.5,
  mt: 6,
  maxWidth: 980,
};

const heroImageSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', lg: '1.25fr .75fr' },
  gap: 2,
  mt: 5,
  maxWidth: 1180,
};

const metricSx = {
  p: 2.5,
  borderRadius: 4,
  border: '1px solid rgba(148,163,184,.18)',
  backgroundColor: 'rgba(15,23,42,.62)',
  boxShadow: '0 18px 60px rgba(0,0,0,.26)',
};

const sectionSx = {
  position: 'relative',
  maxWidth: 1220,
  mx: 'auto',
  py: { xs: 7, md: 10 },
  scrollMarginTop: 130,
};

const eyebrowSx = {
  color: '#67e8f9',
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: 1.8,
  fontSize: 13,
  mb: 1.2,
};

const sectionTitleSx = {
  color: '#f8fafc',
  fontSize: { xs: 36, md: 62 },
  lineHeight: 1.02,
  fontWeight: 950,
  letterSpacing: 0,
  maxWidth: 1000,
};

const leadSx = {
  color: '#bdd0e9',
  fontSize: { xs: 17, md: 21 },
  lineHeight: 1.65,
  maxWidth: 850,
  mt: 2,
  mb: 4,
};

const bodySx = { color: '#9fb0c8', lineHeight: 1.7 };

const grid3Sx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
  gap: 2,
  mt: 4,
};

const grid4Sx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
  gap: 2,
  mt: 4,
};

const cardSx = {
  p: { xs: 2.5, md: 3 },
  minHeight: 230,
  borderRadius: 4,
  border: '1px solid rgba(148,163,184,.16)',
  background: 'linear-gradient(180deg, rgba(15,23,42,.86), rgba(15,23,42,.52))',
  boxShadow: '0 24px 80px rgba(0,0,0,.28)',
};

const iconBoxSx = {
  width: 48,
  height: 48,
  display: 'grid',
  placeItems: 'center',
  mb: 2,
  borderRadius: 2.5,
  backgroundColor: 'rgba(103,232,249,.10)',
  border: '1px solid rgba(103,232,249,.18)',
};

const imageRibbonSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
  gap: 2,
  mt: 4,
};

const imagePanelSx = {
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 5,
  border: '1px solid rgba(148,163,184,.18)',
  backgroundColor: 'rgba(15,23,42,.66)',
  boxShadow: '0 30px 90px rgba(0,0,0,.34)',
  isolation: 'isolate',
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.06)',
    pointerEvents: 'none',
  },
};

const imageSx = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  filter: 'saturate(1.08) contrast(1.05)',
  transform: 'scale(1.02)',
};

const imageOverlaySx = {
  position: 'absolute',
  inset: 0,
  background:
    'linear-gradient(180deg, rgba(2,6,23,.08), rgba(2,6,23,.78)), linear-gradient(135deg, rgba(8,47,73,.55), rgba(16,185,129,.12))',
  zIndex: 1,
};

const imageCaptionSx = {
  position: 'absolute',
  left: 24,
  right: 24,
  bottom: 22,
  zIndex: 2,
};

const jqlCardSx = {
  mt: 3,
  p: 3,
  borderRadius: 4,
  border: '1px solid rgba(103,232,249,.22)',
  background: 'linear-gradient(135deg, rgba(8,47,73,.55), rgba(15,23,42,.82))',
};

const codeSx = {
  overflowX: 'auto',
  color: '#d1fae5',
  my: 1.5,
  p: 2,
  borderRadius: 3,
  backgroundColor: 'rgba(2,6,23,.68)',
  fontFamily: 'Consolas, Monaco, monospace',
};

const architectureSx = {
  display: 'flex',
  flexDirection: { xs: 'column', lg: 'row' },
  alignItems: 'stretch',
  gap: 2,
  mt: 4,
};

const flowNodeSx = {
  flex: 1,
  p: 3,
  borderRadius: 4,
  border: '1px solid rgba(103,232,249,.22)',
  background: 'rgba(15,23,42,.68)',
};

const arrowSx = {
  display: 'grid',
  placeItems: 'center',
  color: '#67e8f9',
  fontWeight: 950,
  fontSize: 30,
};

const demoTimelineSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(6, 1fr)' },
  gap: 1.4,
  mt: 3,
};

const timelineItemSx = {
  p: 2,
  minHeight: 120,
  borderRadius: 3,
  border: '1px solid rgba(148,163,184,.14)',
  backgroundColor: 'rgba(2,6,23,.38)',
};

const solidGridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' },
  gap: 1.5,
  mt: 4,
};

const solidCardSx = {
  p: 2.5,
  borderRadius: 4,
  border: '1px solid rgba(52,211,153,.22)',
  background: 'linear-gradient(180deg, rgba(6,78,59,.34), rgba(15,23,42,.72))',
};

const solidLetterSx = {
  width: 44,
  height: 44,
  display: 'grid',
  placeItems: 'center',
  borderRadius: '50%',
  mb: 2,
  color: '#022c22',
  background: 'linear-gradient(135deg, #6ee7b7, #67e8f9)',
  fontWeight: 950,
  fontSize: 20,
};

const splitSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
  gap: 2,
  mt: 4,
};

const miniCardSx = {
  p: 2.4,
  borderRadius: 3,
  border: '1px solid rgba(148,163,184,.14)',
  backgroundColor: 'rgba(15,23,42,.56)',
};

const roadmapSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
  gap: 2,
  mt: 4,
};

const roadmapItemSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  p: 2.3,
  borderRadius: 4,
  border: '1px solid rgba(103,232,249,.18)',
  backgroundColor: 'rgba(8,47,73,.34)',
};

const roadmapDotSx = {
  width: 42,
  height: 42,
  flexShrink: 0,
  display: 'grid',
  placeItems: 'center',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #22d3ee, #10b981)',
  color: '#02111f',
  fontWeight: 950,
};

const pricingGridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
  gap: 2,
  mt: 4,
};

const pricingCardSx = {
  p: 3,
  minHeight: 280,
  borderRadius: 4,
  border: '1px solid rgba(148,163,184,.16)',
  backgroundColor: 'rgba(15,23,42,.74)',
};

const featuredPricingSx = {
  transform: { md: 'translateY(-18px)' },
  background: 'linear-gradient(135deg, #67e8f9, #34d399)',
  boxShadow: '0 30px 90px rgba(16,185,129,.25)',
};

const learningGridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
  gap: 1.5,
  mt: 4,
};

const learningPillSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.1,
  p: 2,
  borderRadius: 999,
  border: '1px solid rgba(52,211,153,.18)',
  backgroundColor: 'rgba(6,78,59,.20)',
};

const thanksSx = {
  position: 'relative',
  minHeight: '70vh',
  maxWidth: 1220,
  mx: 'auto',
  py: 10,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  scrollMarginTop: 130,
};