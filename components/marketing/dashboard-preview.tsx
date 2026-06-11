import {
  LayoutDashboard,
  Library,
  BookOpen,
  Sparkles,
  Target,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Knowledge Library', icon: Library, active: false },
  { label: 'Subjects', icon: BookOpen, active: false },
  { label: 'Quiz Generator', icon: Sparkles, active: false },
  { label: 'Exam Readiness', icon: Target, active: false },
]

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

const subjects = [
  { label: 'Mathematics', value: 75 },
  { label: 'Physics', value: 60 },
  { label: 'Literature', value: 87 },
  { label: 'History', value: 50 },
]

// Simple ascending sparkline for the "Knowledge growth" area chart.
const points = [
  [0, 150],
  [100, 120],
  [200, 130],
  [300, 80],
  [400, 70],
  [500, 35],
  [600, 20],
]

function buildPath(coords: number[][]) {
  return coords.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ')
}

const linePath = buildPath(points)
const areaPath = `${linePath} L 600 200 L 0 200 Z`

const readiness = 85

export function DashboardPreview() {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - readiness / 100)

  return (
    <div
      aria-hidden="true"
      className="flex w-full overflow-hidden rounded-xl bg-card text-card-foreground"
    >
      {/* Sidebar */}
      <aside className="hidden w-48 shrink-0 flex-col gap-1 border-r border-border bg-background/40 p-4 sm:flex">
        <div className="mb-4 flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Library className="size-5" />
        </div>
        {navItems.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm ${
              item.active
                ? 'bg-primary/10 font-medium text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            <item.icon className="size-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </div>
        ))}
      </aside>

      {/* Main */}
      <div className="flex-1 p-5 sm:p-6">
        <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Dashboard
        </h3>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Knowledge growth chart */}
          <div className="rounded-lg border border-border bg-background/40 p-4 lg:col-span-2">
            <p className="text-sm font-medium">Knowledge growth</p>
            <p className="text-xs text-muted-foreground">
              Concepts accumulated over the last 6 months
            </p>
            <div className="mt-4">
              <svg
                viewBox="0 0 600 200"
                preserveAspectRatio="none"
                className="h-32 w-full sm:h-40"
              >
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--primary)"
                      stopOpacity="0.3"
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--primary)"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>
                <path d={areaPath} fill="url(#areaFill)" />
                <path
                  d={linePath}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="mt-2 flex justify-between text-[10px] text-muted-foreground sm:text-xs">
                {months.map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Exam readiness ring */}
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-background/40 p-4">
            <p className="text-sm font-medium">Exam Readiness</p>
            <div className="relative mt-3 flex items-center justify-center">
              <svg width="128" height="128" viewBox="0 0 128 128">
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="10"
                />
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  transform="rotate(-90 64 64)"
                />
              </svg>
              <span className="absolute text-3xl font-semibold">
                {readiness}
              </span>
            </div>
          </div>
        </div>

        {/* Subject progress */}
        <div className="mt-4 rounded-lg border border-border bg-background/40 p-4">
          <p className="text-sm font-medium">Subject mastery</p>
          <div className="mt-3 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            {subjects.map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between text-sm">
                  <span>{s.label}</span>
                  <span className="text-muted-foreground">{s.value}%</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${s.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
