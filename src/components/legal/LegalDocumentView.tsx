import { motion } from "framer-motion";
import type { LegalDocument } from "@/lib/legalContent";

interface Props {
  document: LegalDocument;
}

export function LegalDocumentView({ document }: Props) {
  return (
    <motion.article
      key={document.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-7"
    >
      <header className="space-y-1.5">
        <h2 className="text-[19px] font-semibold tracking-[-0.01em] text-foreground leading-tight">
          {document.title}
        </h2>
        <p className="text-xs text-muted-foreground/80">
          JÁLIMPO Tecnologia e Intermediação de Serviços LTDA
        </p>
      </header>

      <div className="space-y-6">
        {document.sections.map((section, idx) => (
          <section key={idx} className="space-y-2.5">
            <h3 className="text-[14px] font-semibold text-foreground tracking-[-0.005em]">
              {section.title}
            </h3>
            <div className="space-y-3">
              {section.paragraphs.map((p, i) => {
                if (typeof p === "string") {
                  return (
                    <p
                      key={i}
                      className="text-[13.5px] text-muted-foreground leading-[1.65]"
                    >
                      {p}
                    </p>
                  );
                }
                if (p.type === "list") {
                  return (
                    <ul key={i} className="space-y-1.5 pl-1">
                      {p.items.map((item, j) => (
                        <li
                          key={j}
                          className="text-[13.5px] text-muted-foreground leading-[1.6] flex gap-2.5"
                        >
                          <span className="mt-[7px] w-1 h-1 rounded-full bg-primary/60 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <div
                    key={i}
                    className="rounded-xl border border-primary/15 bg-primary/[0.04] px-3.5 py-3"
                  >
                    <p className="text-[13px] text-foreground/90 leading-[1.6]">
                      {p.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </motion.article>
  );
}
