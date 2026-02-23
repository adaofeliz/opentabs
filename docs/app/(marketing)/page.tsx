import Footer from '@/components/footer';
import { ArchitectureIllustration } from '@/components/illustrations';
import { Button, Text } from '@/components/retroui';
import { SiGithub } from '@icons-pack/react-simple-icons';
import Link from 'next/link';

const steps = [
  {
    step: 1,
    title: 'Your AI agent sends a tool call',
    description:
      'Claude, Cursor, or any MCP-compatible agent calls a tool like slack_send_message or jira_create_issue — just like calling an API.',
  },
  {
    step: 2,
    title: 'OpenTabs routes it to your browser',
    description:
      'The MCP server dispatches the call to the Chrome extension, which injects it into the correct tab — using your existing authenticated session.',
  },
  {
    step: 3,
    title: 'The action runs on the real web app',
    description:
      'The plugin adapter executes the action directly in the page context, with full access to the DOM and same-origin APIs. Results flow back to the agent.',
  },
];

export default function Home() {
  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="container mx-auto max-w-6xl px-4 pt-14 pb-8 lg:px-0 lg:pt-20 lg:pb-10">
        <div className="mx-auto max-w-3xl text-center">
          <Text as="h1" className="text-foreground mb-6 text-5xl lg:text-6xl">
            AI agents for
            <br />
            any web app
          </Text>
          <p className="text-muted-foreground mx-auto mb-10 max-w-xl text-lg">
            Give AI agents access to any web application through your authenticated browser session. No API keys. No
            reverse engineering. Just your browser.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/docs/quick-start" passHref>
              <Button>Get Started</Button>
            </Link>
            <Link href="https://github.com/AnomalyCo/opentabs" target="_blank" passHref>
              <Button variant="outline">
                <SiGithub size={16} className="mr-2" />
                GitHub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Architecture Illustration ─────────────────────── */}
      <section className="container mx-auto max-w-5xl px-4 pb-12 lg:px-0">
        <div className="relative">
          <div className="bg-foreground absolute inset-0 translate-x-3 translate-y-3" />
          <div className="border-foreground bg-background relative border-4 p-6 lg:p-8">
            <ArchitectureIllustration />
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="border-foreground container mx-auto max-w-6xl border-t-2 px-4 py-20 lg:px-0">
        <Text as="h2" className="mb-12 text-3xl">
          How it works
        </Text>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {steps.map(item => (
            <div key={item.step} className="flex gap-5">
              <span className="border-foreground bg-primary text-foreground flex h-10 w-10 flex-shrink-0 items-center justify-center border-2 text-sm font-bold">
                {item.step}
              </span>
              <div>
                <p className="text-foreground mb-2 font-bold">{item.title}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="container mx-auto my-24 max-w-6xl px-4 lg:px-0">
        <div className="border-foreground bg-primary flex flex-col items-center justify-between gap-8 border-4 px-8 py-14 lg:flex-row">
          <div>
            <Text as="h2" className="text-foreground mb-2">
              Build plugins for any website
            </Text>
            <p className="text-foreground/70">
              Open source. Plugin SDK included. Publish to npm and share with the community.
            </p>
          </div>
          <div className="flex flex-shrink-0 flex-col gap-4 sm:flex-row">
            <Link href="/docs/quick-start" passHref>
              <Button className="bg-background" variant="outline">
                Quick Start
              </Button>
            </Link>
            <Link href="https://github.com/AnomalyCo/opentabs" target="_blank" passHref>
              <Button className="bg-background" variant="outline">
                <SiGithub size={16} className="mr-2" />
                View on GitHub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
