import { FileQuestion } from "lucide-react";

import AppShell from "@/components/layout/app-shell";
import Container from "@/components/layout/container";
import SpecStrip from "@/components/spec-strip";
import EmptyState from "@/components/empty-state";
import UserAvatar from "@/components/user-avatar";
import { PostCardSkeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Internal reference page for the design system. Not linked from navigation —
 * it exists so the tokens can be reviewed together in both themes.
 */
export const metadata = { title: "Design system" };

const SWATCHES = [
    { name: "background", cls: "bg-background" },
    { name: "card", cls: "bg-card" },
    { name: "muted", cls: "bg-muted" },
    { name: "secondary", cls: "bg-secondary" },
    { name: "primary", cls: "bg-primary" },
    { name: "signal", cls: "bg-signal" },
    { name: "rule", cls: "bg-rule" },
    { name: "destructive", cls: "bg-destructive" },
];

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="border-t border-border py-12">
        <h2 className="mb-6 font-mono text-2xs uppercase text-muted-foreground">
            {title}
        </h2>
        {children}
    </section>
);

export default function DesignSystemPage() {
    return (
        <AppShell glow>
            <Container width="wide" className="py-12">
                <header className="mb-4">
                    <p className="label text-signal">Instrument</p>
                    <h1 className="mt-3 text-5xl font-bold">The design system</h1>
                    <p className="mt-4 max-w-prose text-lg text-muted-foreground">
                        High-contrast neutrals with a single saturated red. Space Grotesk
                        for display, Geist for body and data.
                    </p>
                </header>

                <Section title="Palette">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {SWATCHES.map((s) => (
                            <div key={s.name}>
                                <div
                                    className={`h-16 rounded-md border border-rule ${s.cls}`}
                                />
                                <p className="mt-2 font-mono text-2xs uppercase text-muted-foreground">
                                    {s.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section title="Type scale">
                    <div className="space-y-4">
                        <p className="font-display text-6xl font-bold tracking-tight">
                            Display 6xl
                        </p>
                        <p className="font-display text-4xl font-semibold">Display 4xl</p>
                        <p className="font-display text-2xl font-semibold">Display 2xl</p>
                        <p className="max-w-prose text-lg">
                            Body large, Geist Sans. Set at a 68-character measure so a
                            paragraph stays comfortable to read across a full-width screen.
                        </p>
                        <p className="label">Mono 2xs · metadata and labels</p>
                    </div>
                </Section>

                <Section title="Spec strip">
                    <div className="max-w-xl rounded-lg border border-border bg-card p-6">
                        <h3 className="mb-4 font-display text-xl font-semibold">
                            Line-Following Robot with PID Control
                        </h3>
                        <SpecStrip
                            specs={[
                                { label: "Author", value: "Rohan Mehta" },
                                { label: "Published", value: <time>2026-04-27</time> },
                                { label: "Reading", value: "2 min" },
                                { label: "Upvotes", value: <span data-numeric>5</span> },
                            ]}
                        />
                    </div>
                </Section>

                <Section title="Prose">
                    <div className="prose-editorial max-w-prose">
                        <p>
                            Our first PID controller made the robot weave violently down a
                            straight line — overshooting, correcting, overshooting harder.
                        </p>
                        <h2>The actual cause</h2>
                        <p>
                            The problem was not the gains. It was the sampling rate, and a
                            blocking <a href="#">serial print</a> inside the control loop.
                        </p>
                        <blockquote>
                            We spent two weekends tuning gains for a problem that was
                            actually a blocked control loop.
                        </blockquote>
                        <ul>
                            <li>Kp 0.8, Ki 0.0, Kd 12.0</li>
                            <li>Control loop above 500 Hz with no blocking calls</li>
                        </ul>
                        <pre>{`digitalWrite(SENSOR_POWER, HIGH);\nint raw = analogRead(SENSOR_PIN);`}</pre>
                    </div>
                </Section>

                <Section title="Avatars — deterministic fallback">
                    <div className="flex flex-wrap gap-3">
                        {["Varad Patil", "Ananya Deshpande", "Rohan Mehta", "Priya Nair",
                          "Karthik Raman", "Sneha Iyer", "Aditya Kulkarni", "Meera Joshi"].map((n) => (
                            <UserAvatar key={n} name={n} className="h-12 w-12" />
                        ))}
                    </div>
                </Section>

                <Section title="Controls">
                    <div className="flex flex-wrap items-center gap-3">
                        <Button>Publish</Button>
                        <Button variant="secondary">Save draft</Button>
                        <Button variant="outline">Preview</Button>
                        <Button variant="ghost">Cancel</Button>
                        <Button variant="destructive">Delete</Button>
                        <Badge>robotics</Badge>
                        <Badge variant="secondary">arduino</Badge>
                    </div>
                </Section>

                <Section title="Empty and loading states">
                    <div className="grid gap-6 md:grid-cols-2">
                        <EmptyState
                            title="No posts yet"
                            description="Write-ups you publish will collect here."
                            action={{ label: "Write your first post", href: "/create-post" }}
                            icon={<FileQuestion className="h-8 w-8" />}
                        />
                        <PostCardSkeleton />
                    </div>
                </Section>
            </Container>
        </AppShell>
    );
}
