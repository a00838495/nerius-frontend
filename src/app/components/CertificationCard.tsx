import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Award, Loader2, CheckCircle, Clock, DollarSign, Gift } from "lucide-react";
import { toast } from "sonner";
import type { CourseCertification, UserCertification } from "../types/certification";

interface CertificationCardProps {
  courseId: string;
  courseCompleted: boolean;
}

export default function CertificationCard({ courseId, courseCompleted }: CertificationCardProps) {
  const [cert, setCert] = useState<CourseCertification | null>(null);
  const [userCert, setUserCert] = useState<UserCertification | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const certRes = await fetch(`/api/v1/courses/${courseId}/certification`, { credentials: "include" });
        if (!certRes.ok) { setLoading(false); return; }
        const certData: CourseCertification = await certRes.json();
        setCert(certData);

        // Check if user already requested
        const myRes = await fetch("/api/v1/certifications/my", { credentials: "include" });
        if (myRes.ok) {
          const myCerts: UserCertification[] = await myRes.json();
          const existing = myCerts.find((uc) => uc.course_certification.course_id === courseId);
          if (existing) setUserCert(existing);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  const handleRequest = async () => {
    setRequesting(true);
    try {
      const res = await fetch(`/api/v1/courses/${courseId}/certification/request`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const data: UserCertification = await res.json();
        setUserCert(data);
        toast.success("Certificación solicitada exitosamente");
      } else {
        const err = await res.json();
        toast.error(err.detail || "Error al solicitar certificación");
      }
    } catch {
      toast.error("Error al solicitar certificación");
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return null;
  if (!cert) return null;

  const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
    requested: { label: "Solicitada", color: "#0099DC", bg: "rgba(0,153,220,0.1)" },
    approved: { label: "Aprobada", color: "#E5A800", bg: "rgba(229,168,0,0.1)" },
    issued: { label: "Emitida", color: "#4A8A2C", bg: "rgba(74,138,44,0.1)" },
    rejected: { label: "Rechazada", color: "#DC2626", bg: "rgba(220,38,38,0.1)" },
  };

  const costText = cert.is_free_for_user
    ? "Gratis para ti"
    : cert.cost
    ? `$${cert.cost} USD`
    : "Gratis";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1C3A5C 0%, #0D2340 50%, #1C3A5C 100%)",
        boxShadow: "0 8px 32px rgba(28,58,92,0.2)",
      }}
    >
      {/* Gold accent line */}
      <div className="h-1" style={{ background: "linear-gradient(90deg, #E5A800, #F5D060, #E5A800)" }} />

      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #E5A800, #F5D060)", boxShadow: "0 4px 12px rgba(229,168,0,0.4)" }}
          >
            <Award size={24} color="#1C3A5C" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white mb-1">{cert.title}</h3>
            {cert.description && (
              <p className="text-sm mb-3" style={{ color: "#89B8D4" }}>{cert.description}</p>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{
                backgroundColor: cert.is_free_for_user ? "rgba(74,138,44,0.15)" : "rgba(229,168,0,0.15)",
                color: cert.is_free_for_user ? "#7FCF5A" : "#F5D060",
              }}>
                {cert.is_free_for_user ? <Gift size={12} /> : <DollarSign size={12} />}
                {costText}
              </span>
              {cert.validity_days && (
                <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#89B8D4" }}>
                  <Clock size={12} />
                  Válida por {cert.validity_days >= 365 ? `${Math.floor(cert.validity_days / 365)} año${cert.validity_days >= 730 ? "s" : ""}` : `${cert.validity_days} días`}
                </span>
              )}
            </div>

            {/* Action / Status */}
            {userCert ? (
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: statusLabels[userCert.status]?.bg, color: statusLabels[userCert.status]?.color }}
                >
                  <CheckCircle size={12} />
                  {statusLabels[userCert.status]?.label}
                </span>
                {userCert.certificate_url && (
                  <a
                    href={userCert.certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold underline"
                    style={{ color: "#F5D060" }}
                  >
                    Ver certificado
                  </a>
                )}
              </div>
            ) : courseCompleted ? (
              <button
                onClick={handleRequest}
                disabled={requesting}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, #E5A800, #F5D060)",
                  color: "#1C3A5C",
                  boxShadow: "0 4px 12px rgba(229,168,0,0.3)",
                }}
              >
                {requesting ? (
                  <><Loader2 size={16} className="animate-spin" /> Solicitando...</>
                ) : (
                  <><Award size={16} /> Solicitar Certificación</>
                )}
              </button>
            ) : (
              <p className="text-xs" style={{ color: "#89B8D4" }}>
                Completa el curso para solicitar esta certificación
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
