import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, Minus, Plus, RotateCcw, TriangleAlert } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  CONFIG_PADRAO,
  MOVIMENTO_PADRAO,
  SERVICOS,
  brl,
  comSinal,
  diariasParaCompensar,
  ganhoDiarista,
  maiorDesconto,
  precos,
  resultadoDoMes,
  sobraPorPedido,
  type ConfigCalc,
  type Movimento,
} from "@/lib/planosCalc";

type Aba = "diarista" | "jalimpo";

function Bloco({ titulo, dica, children }: { titulo: string; dica?: string; children: ReactNode }) {
  return (
    <section className="p-4 lg:p-5 rounded-2xl border border-border/60 bg-card">
      <h2 className="font-semibold text-foreground">{titulo}</h2>
      {dica && <p className="text-sm text-muted-foreground mt-0.5">{dica}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Contador({
  rotulo,
  dica,
  valor,
  onChange,
  min = 0,
  max = 9999,
  passo = 1,
}: {
  rotulo: string;
  dica?: string;
  valor: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  passo?: number;
}) {
  const limitar = (v: number) => Math.min(max, Math.max(min, Math.round(Number.isFinite(v) ? v : 0)));
  const botao = "w-10 h-10 rounded-xl border border-border bg-background hover:bg-muted transition-colors flex items-center justify-center";
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-t border-border/60 first:border-t-0">
      <div className="min-w-0">
        <p className="text-sm text-foreground">{rotulo}</p>
        {dica && <p className="text-xs text-muted-foreground">{dica}</p>}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button type="button" className={botao} onClick={() => onChange(limitar(valor - passo))} aria-label={`Diminuir ${rotulo}`}>
          <Minus className="w-4 h-4" />
        </button>
        <input
          inputMode="numeric"
          value={valor}
          onChange={(e) => onChange(limitar(Number(e.target.value.replace(/\D/g, ""))))}
          aria-label={rotulo}
          className="w-16 h-10 text-center rounded-xl border border-border bg-background font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        <button type="button" className={botao} onClick={() => onChange(limitar(valor + passo))} aria-label={`Aumentar ${rotulo}`}>
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function Ajuste({ rotulo, valor, onChange }: { rotulo: string; valor: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="block text-xs text-muted-foreground mb-1">{rotulo}</span>
      <input
        inputMode="decimal"
        defaultValue={String(valor).replace(".", ",")}
        key={valor}
        onBlur={(e) => {
          const v = Number(e.target.value.replace(/\./g, "").replace(",", "."));
          onChange(Number.isFinite(v) && v >= 0 ? v : 0);
        }}
        className="w-full h-10 px-3 rounded-xl border border-border bg-background tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      />
    </label>
  );
}

function Linha({ rotulo, valor, forte }: { rotulo: string; valor: string; forte?: boolean }) {
  return (
    <div className={cn("flex justify-between gap-3 py-2 text-sm tabular-nums border-t", forte ? "border-foreground font-semibold" : "border-border/60")}>
      <span className={forte ? "text-foreground" : "text-muted-foreground"}>{rotulo}</span>
      <span className="text-foreground">{valor}</span>
    </div>
  );
}

export default function AdminCalculator() {
  const [aba, setAba] = useState<Aba>("diarista");
  const [config, setConfig] = useState<ConfigCalc>(CONFIG_PADRAO);
  const [qtd, setQtd] = useState<[number, number, number]>([8, 4, 0]);
  const [mov, setMov] = useState<Movimento>(MOVIMENTO_PADRAO);
  const [ajustes, setAjustes] = useState(false);

  const p = precos(config);
  const livre = config.planos[0];
  const pagos = config.planos.slice(1);

  // ── Diarista ──
  const ganhos = config.planos.map((pl) => ganhoDiarista(config, pl, qtd));
  const melhor = ganhos.indexOf(Math.max(...ganhos));
  const semServico = qtd[0] + qtd[1] + qtd[2] === 0;

  // ── Já Limpo ──
  const res = useMemo(() => resultadoDoMes(config, mov, true), [config, mov]);
  const base = useMemo(() => resultadoDoMes(config, mov, false), [config, mov]);
  const diferenca = res.liquido - base.liquido;

  const mudar = (parte: Partial<ConfigCalc>) => setConfig((c) => ({ ...c, ...parte }));
  const mudarPlano = (i: number, parte: { mensalidade?: number; comissao?: number }) =>
    setConfig((c) => ({ ...c, planos: c.planos.map((pl, j) => (j === i ? { ...pl, ...parte } : pl)) }));
  const mudarTrio = (campo: "descontoCasa" | "descontoEmpresa" | "premio", i: number, v: number) =>
    setConfig((c) => {
      const novo = [...c[campo]] as [number, number, number];
      novo[i] = v;
      return { ...c, [campo]: novo };
    });
  const mudarMov = (parte: Partial<Movimento>) => setMov((m) => ({ ...m, ...parte }));

  return (
    <AdminLayout fixo>
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-foreground">Calculadora de planos</h1>
        <p className="text-sm text-muted-foreground">Simule quanto a diarista recebe e quanto o Já Limpo ganha. Nada aqui altera o app.</p>
      </div>

      <div className="flex gap-2">
        {([
          ["diarista", "Diarista"],
          ["jalimpo", "Já Limpo"],
        ] as [Aba, string][]).map(([id, nome]) => (
          <button
            key={id}
            onClick={() => setAba(id)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium border transition-colors",
              aba === id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-muted",
            )}
          >
            {nome}
          </button>
        ))}
      </div>

      <div className="admin-rolagem space-y-4">
        {aba === "diarista" && (
          <>
            <Bloco titulo="Serviços no mês" dica="Quantos serviços a diarista faz pelo app em um mês.">
              {SERVICOS.map((nome, i) => (
                <Contador
                  key={nome}
                  rotulo={nome}
                  dica={`Cliente paga ${brl(p[i])}`}
                  valor={qtd[i]}
                  max={62}
                  onChange={(v) => setQtd((q) => q.map((x, j) => (j === i ? v : x)) as [number, number, number])}
                />
              ))}
            </Bloco>

            <Bloco titulo="Quanto ela recebe no mês" dica="Já descontadas a comissão e a mensalidade do plano.">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {config.planos.map((pl, i) => {
                  const dif = ganhos[i] - ganhos[0];
                  const destaque = !semServico && i === melhor;
                  return (
                    <div key={pl.id} className={cn("p-4 rounded-xl border", destaque ? "border-primary bg-primary/5" : "border-border/60")}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-foreground">{pl.nome}</p>
                        {destaque && <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary text-primary-foreground">Rende mais</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {pl.mensalidade > 0 ? `${brl(pl.mensalidade)} por mês` : "Sem mensalidade"} · comissão {pl.comissao}%
                      </p>
                      <p className="text-2xl font-bold text-foreground tabular-nums mt-2">{brl(ganhos[i])}</p>
                      {i === 0 ? (
                        <p className="text-xs text-muted-foreground">base de comparação</p>
                      ) : (
                        <p className={cn("text-xs font-semibold", dif >= 0 ? "text-success" : "text-destructive")}>{comSinal(dif)} no mês</p>
                      )}
                      {pl.extras && <p className="text-xs text-muted-foreground mt-2">+ {pl.extras}</p>}
                    </div>
                  );
                })}
              </div>
            </Bloco>

            <Bloco titulo="Quando cada plano compensa" dica="Contando só diárias completas no mês, contra ficar sem plano.">
              <div className="overflow-x-auto">
                <table className="w-full text-sm tabular-nums">
                  <thead>
                    <tr className="text-xs text-muted-foreground">
                      <th className="text-left font-medium py-2">Plano</th>
                      <th className="text-right font-medium py-2">Recebe por diária</th>
                      <th className="text-right font-medium py-2">A mais por diária</th>
                      <th className="text-right font-medium py-2">Se paga com</th>
                    </tr>
                  </thead>
                  <tbody>
                    {config.planos.map((pl) => {
                      const n = diariasParaCompensar(config, pl);
                      return (
                        <tr key={pl.id} className="border-t border-border/60">
                          <td className="py-2 text-foreground">{pl.nome}</td>
                          <td className="py-2 text-right">{brl(p[0] * (1 - pl.comissao / 100))}</td>
                          <td className="py-2 text-right">{pl.id === "livre" ? "" : brl((p[0] * (livre.comissao - pl.comissao)) / 100)}</td>
                          <td className="py-2 text-right font-medium text-foreground">
                            {pl.id === "livre" ? "" : n === null ? "não se paga" : `${n} ${n === 1 ? "diária" : "diárias"}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                O PREMIUM tem a mesma comissão do ELITE. A diferença de mensalidade paga o uniforme, o crachá e o kit.
              </p>
            </Bloco>
          </>
        )}

        {aba === "jalimpo" && (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                <Bloco titulo="Movimento" dica="Pedidos por dia e dias de trabalho no mês.">
                  {SERVICOS.map((nome, i) => (
                    <Contador
                      key={nome}
                      rotulo={`${nome} por dia`}
                      valor={mov.porDia[i]}
                      onChange={(v) => mudarMov({ porDia: mov.porDia.map((x, j) => (j === i ? v : x)) as [number, number, number] })}
                    />
                  ))}
                  <Contador rotulo="Dias de trabalho no mês" dica="Segunda a sexta dá 22" valor={mov.dias} min={1} max={31} onChange={(v) => mudarMov({ dias: v })} />
                  <Contador rotulo="Pedidos pagos no cartão (%)" dica="O resto é Pix" valor={mov.cartaoPct} max={100} passo={10} onChange={(v) => mudarMov({ cartaoPct: v })} />
                </Bloco>

                <Bloco titulo="Diaristas e planos" dica="A conta divide os pedidos por igual entre as diaristas ativas.">
                  <Contador rotulo="Diaristas ativas" valor={mov.diaristasAtivas} min={1} onChange={(v) => mudarMov({ diaristasAtivas: v })} />
                  {pagos.map((pl, i) => (
                    <Contador
                      key={pl.id}
                      rotulo={`No plano ${pl.nome}`}
                      dica={`${brl(pl.mensalidade)} por mês · comissão ${pl.comissao}%`}
                      valor={mov.assinantes[i] || 0}
                      onChange={(v) => mudarMov({ assinantes: pagos.map((_, j) => (j === i ? v : mov.assinantes[j] || 0)) })}
                    />
                  ))}
                </Bloco>

                <Bloco titulo="Clientes e vantagens">
                  <Contador rotulo="Clientes no Clube Casa" dica={`${brl(config.clubeCasa)} por mês`} valor={mov.clubeCasa} onChange={(v) => mudarMov({ clubeCasa: v })} />
                  <Contador rotulo="Clientes no Clube Empresa" dica={`${brl(config.clubeEmpresa)} por mês`} valor={mov.clubeEmpresa} onChange={(v) => mudarMov({ clubeEmpresa: v })} />
                  <Contador rotulo="Pedidos por mês de cada assinante" valor={mov.pedidosPorAssinante} max={31} onChange={(v) => mudarMov({ pedidosPorAssinante: v })} />
                  <Contador rotulo="Clientes novas por indicação no mês" valor={mov.indicacoes} onChange={(v) => mudarMov({ indicacoes: v })} />
                  <div className="flex items-center justify-between gap-3 py-2.5 border-t border-border/60">
                    <div>
                      <p className="text-sm text-foreground">Fidelidade ligada</p>
                      <p className="text-xs text-muted-foreground">Prêmio a cada {config.fidelidadeCada} serviços, para quem não é do clube</p>
                    </div>
                    <Switch checked={mov.fidelidade} onCheckedChange={(v) => mudarMov({ fidelidade: v })} aria-label="Fidelidade ligada" />
                  </div>
                </Bloco>
              </div>

              <div className="space-y-4">
                <Bloco titulo="Sobra do mês para o Já Limpo" dica="Depois das taxas do Asaas e das vantagens. Não inclui custos fixos nem anúncio.">
                  <p className="text-3xl lg:text-4xl font-bold text-foreground tabular-nums">{brl(res.liquido)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sem nenhum plano nem vantagem: {brl(base.liquido)}
                    {Math.abs(diferenca) >= 0.005 && (
                      <span className={cn("font-semibold ml-1", diferenca >= 0 ? "text-success" : "text-destructive")}>({comSinal(diferenca)})</span>
                    )}
                  </p>
                  {diferenca < -0.005 && (
                    <div className="flex items-start gap-2 mt-3 p-3 rounded-xl bg-destructive/10 text-sm text-foreground">
                      <TriangleAlert className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <span>Com esses números os planos deixam {brl(-diferenca)} a menos no mês. Eles só compensam se trouxerem mais pedidos ou segurarem as pessoas no app.</span>
                    </div>
                  )}
                  <div className="mt-4">
                    <Linha rotulo="Pedidos no mês" valor={String(Math.round(res.pedidos))} />
                    <Linha rotulo="Valor pago pelas clientes" valor={brl(res.valorPago)} />
                    <Linha rotulo="Comissões" valor={brl(res.comissao)} />
                    <Linha rotulo="Mensalidades das diaristas" valor={brl(res.mensalidadesDiaristas)} />
                    <Linha rotulo="Mensalidades das clientes" valor={brl(res.mensalidadesClientes)} />
                    <Linha rotulo="Descontos (clube, fidelidade, indicação)" valor={`− ${brl(res.descontoClube + res.descontoFidelidade + res.descontoIndicacao)}`} />
                    <Linha rotulo="Uniforme e kit do PREMIUM" valor={`− ${brl(res.kits)}`} />
                    <Linha rotulo="Taxas do Asaas" valor={`− ${brl(res.taxasPedidos + res.taxasMensalidades)}`} />
                    <Linha rotulo="Repasse Pix às diaristas" valor={`− ${brl(res.repasse)}`} />
                    <Linha rotulo="Imposto informado" valor={`− ${brl(res.imposto)}`} />
                    <Linha rotulo="Sobra" valor={brl(res.liquido)} forte />
                  </div>
                </Bloco>

                <Bloco titulo="Sobra por pedido no pior caso" dica="Pago no cartão, com o maior desconto permitido e o repasse. Negativo significa prejuízo naquele pedido.">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm tabular-nums">
                      <thead>
                        <tr className="text-xs text-muted-foreground">
                          <th className="text-left font-medium py-2">Serviço</th>
                          {[...new Set(config.planos.map((pl) => pl.comissao))].map((com) => (
                            <th key={com} className="text-right font-medium py-2">Comissão {com}%</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {SERVICOS.map((nome, i) => (
                          <tr key={nome} className="border-t border-border/60">
                            <td className="py-2">
                              <span className="text-foreground">{nome}</span>
                              <span className="block text-xs text-muted-foreground">desconto até {brl(maiorDesconto(config, i))}</span>
                            </td>
                            {[...new Set(config.planos.map((pl) => pl.comissao))].map((com) => {
                              const v = sobraPorPedido(config, p[i], com, maiorDesconto(config, i), true);
                              return (
                                <td key={com} className={cn("py-2 text-right font-semibold", v >= 0 ? "text-success" : "text-destructive")}>
                                  {brl(v)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Bloco>
              </div>
            </div>
          </>
        )}

        <section className="rounded-2xl border border-border/60 bg-card">
          <button onClick={() => setAjustes((a) => !a)} className="w-full flex items-center justify-between gap-3 p-4 lg:p-5 text-left" aria-expanded={ajustes}>
            <span>
              <span className="block font-semibold text-foreground">Preços, comissões e taxas</span>
              <span className="block text-sm text-muted-foreground">Mude para testar outro cenário. Vale só nesta tela.</span>
            </span>
            <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform", ajustes && "rotate-180")} />
          </button>
          {ajustes && (
            <div className="px-4 lg:px-5 pb-5 space-y-5">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Preço para a cliente (R$)</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Ajuste rotulo="Diária completa" valor={config.precoDiaria} onChange={(v) => mudar({ precoDiaria: v })} />
                  <Ajuste rotulo="Meio período" valor={config.precoMeio} onChange={(v) => mudar({ precoMeio: v })} />
                  <Ajuste rotulo="Emergência" valor={config.precoEmergencia} onChange={(v) => mudar({ precoEmergencia: v })} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Planos da diarista</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {config.planos.map((pl, i) => (
                    <div key={pl.id} className="space-y-2">
                      {i > 0 ? (
                        <Ajuste rotulo={`${pl.nome}: mensalidade (R$)`} valor={pl.mensalidade} onChange={(v) => mudarPlano(i, { mensalidade: v })} />
                      ) : (
                        <div className="h-[60px] flex items-end text-xs text-muted-foreground pb-3">{pl.nome}</div>
                      )}
                      <Ajuste rotulo={`${pl.nome}: comissão (%)`} valor={pl.comissao} onChange={(v) => mudarPlano(i, { comissao: v })} />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                  <Ajuste rotulo="PREMIUM: custo do uniforme + kit a cada 3 meses (R$)" valor={config.custoKitTrimestre} onChange={(v) => mudar({ custoKitTrimestre: v })} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Clube da cliente (R$)</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Ajuste rotulo="Clube Casa por mês" valor={config.clubeCasa} onChange={(v) => mudar({ clubeCasa: v })} />
                  {SERVICOS.map((nome, i) => (
                    <Ajuste key={nome} rotulo={`Casa: desconto ${nome.toLowerCase()}`} valor={config.descontoCasa[i]} onChange={(v) => mudarTrio("descontoCasa", i, v)} />
                  ))}
                  <Ajuste rotulo="Clube Empresa por mês" valor={config.clubeEmpresa} onChange={(v) => mudar({ clubeEmpresa: v })} />
                  {SERVICOS.map((nome, i) => (
                    <Ajuste key={nome} rotulo={`Empresa: desconto ${nome.toLowerCase()}`} valor={config.descontoEmpresa[i]} onChange={(v) => mudarTrio("descontoEmpresa", i, v)} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Fidelidade e indicação (R$)</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SERVICOS.map((nome, i) => (
                    <Ajuste key={nome} rotulo={`Prêmio ${nome.toLowerCase()}`} valor={config.premio[i]} onChange={(v) => mudarTrio("premio", i, v)} />
                  ))}
                  <Ajuste rotulo="Prêmio a cada quantos serviços" valor={config.fidelidadeCada} onChange={(v) => mudar({ fidelidadeCada: Math.max(1, Math.round(v)) })} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Taxas do Asaas e imposto</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Ajuste rotulo="Pix recebido (R$ por cobrança)" valor={config.pix} onChange={(v) => mudar({ pix: v })} />
                  <Ajuste rotulo="Cartão à vista (%)" valor={config.cartaoPct} onChange={(v) => mudar({ cartaoPct: v })} />
                  <Ajuste rotulo="Cartão, valor fixo (R$)" valor={config.cartaoFixo} onChange={(v) => mudar({ cartaoFixo: v })} />
                  <Ajuste rotulo="Repasse Pix à diarista (R$ por pedido)" valor={config.repasse} onChange={(v) => mudar({ repasse: v })} />
                  <Ajuste rotulo="Antecipação do cartão (%; 0 = não antecipa)" valor={config.antecipacaoPct} onChange={(v) => mudar({ antecipacaoPct: v })} />
                  <Ajuste rotulo="Imposto sobre a receita (%; ver com o contador)" valor={config.impostoPct} onChange={(v) => mudar({ impostoPct: v })} />
                </div>
              </div>
              <button
                onClick={() => setConfig(CONFIG_PADRAO)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Voltar aos valores combinados
              </button>
              <p className="text-xs text-muted-foreground">
                Taxas padrão do Asaas em 14/11/2026 (asaas.com/precos-e-taxas). As da conta do Já Limpo ficam em Menu do usuário, Taxas.
              </p>
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
