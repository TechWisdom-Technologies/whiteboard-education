import { useTableData } from "@/hooks/useSupabaseData";
import { GraduationCap, BookOpen, Languages, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/* ── Animated counter hook ────────────────────────────────── */
function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

/* ── Main component ───────────────────────────────────────── */
export function StatsBanner() {
  const { data: universities = [] } = useTableData("universities");
  const { data: courses = [] } = useTableData("courses");
  const { data: languageCenters = [] } = useTableData("language_centers");

  const stats = [
    {
      icon: GraduationCap,
      value: universities.length || 14,
      suffix: "+",
      label: "Partner Universities",
      sublabel: "Top-ranked institutions across Malaysia",
      href: "/universities",
      cta: "View All Universities",
      accentColor: "#ffa300",
      accentBg: "rgba(255, 163, 0, 0.10)",
      iconBg: "linear-gradient(135deg, #ffa300, #e08e00)",
    },
    {
      icon: BookOpen,
      value: courses.length || 21,
      suffix: "+",
      label: "Courses Available",
      sublabel: "From foundation to postgraduate level",
      href: "/courses",
      cta: "View All Courses",
      accentColor: "#2563eb",
      accentBg: "rgba(37, 99, 235, 0.08)",
      iconBg: "linear-gradient(135deg, #3b82f6, #2563eb)",
    },
    {
      icon: Languages,
      value: languageCenters.length || 6,
      suffix: "+",
      label: "Language Centers",
      sublabel: "English & Malay preparation programs",
      href: "/language-centers",
      cta: "View All Centers",
      accentColor: "#059669",
      accentBg: "rgba(5, 150, 105, 0.08)",
      iconBg: "linear-gradient(135deg, #10b981, #059669)",
    },
  ];

  return (
    <section className="stats-banner-section !py-16">
      <div className="container mx-auto px-4 max-w-6xl relative">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#181d29] mb-2">
            Numbers That Speak <span className="stats-banner-heading-accent">For Themselves</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Individual stat card ─────────────────────────────────── */
function StatCard({
  stat,
}: {
  stat: {
    icon: React.ComponentType<{ className?: string }>;
    value: number;
    suffix: string;
    label: string;
    sublabel: string;
    href: string;
    cta: string;
    accentColor: string;
    accentBg: string;
    iconBg: string;
  };
}) {
  const { count, ref } = useCountUp(stat.value);

  return (
    <div ref={ref} className="stats-card group">
      {/* Top accent bar */}
      <div className="stats-card-accent" style={{ background: stat.accentColor }} />

      {/* Icon */}
      <div className="stats-card-icon-wrap">
        <div className="stats-card-icon-bg" style={{ background: stat.iconBg }}>
          <stat.icon className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Number */}
      <p className="stats-card-number">
        {count}
        <span className="stats-card-suffix" style={{ color: stat.accentColor }}>{stat.suffix}</span>
      </p>

      {/* Labels */}
      <p className="stats-card-label">{stat.label}</p>
      <p className="stats-card-sublabel">{stat.sublabel}</p>

      {/* Divider */}
      <div className="stats-card-divider" />

      {/* CTA button */}
      <Link
        to={stat.href}
        className="stats-card-cta"
        style={{ background: stat.accentBg, color: stat.accentColor }}
      >
        {stat.cta}
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
