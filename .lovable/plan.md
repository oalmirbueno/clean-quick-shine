
# Plano: Melhorar Tutorial PWA com Bordas Arredondadas Maiores

## Resumo
Vou atualizar o tutorial de instalação PWA para ter um visual mais suave e moderno, aumentando os cantos arredondados de todos os elementos (botões, cards de ícones, badges) e garantindo que tudo esteja funcionando perfeitamente.

---

## Alterações Visuais

### 1. Ícones Principais (Cards de Step)
| Elemento | Atual | Novo |
|----------|-------|------|
| Ícone introdução (Smartphone) | `rounded-3xl` | `rounded-[2rem]` |
| Ícone dos passos | `rounded-2xl` | `rounded-3xl` |

### 2. Botão Principal (PrimaryButton)
| Elemento | Atual | Novo |
|----------|-------|------|
| Border radius | `rounded-lg` | `rounded-2xl` |

### 3. Badges e Indicadores
| Elemento | Atual | Novo |
|----------|-------|------|
| Badge "Instalação rápida" | `rounded-full` | Manter (já está ótimo) |
| Badge "Passo X de Y" | `rounded-full` | Manter (já está ótimo) |
| Progress dots | `rounded-full` | Manter + aumentar tamanho |

### 4. Botão "Pular" no Header
| Elemento | Atual | Novo |
|----------|-------|------|
| Estilo | Texto simples | `rounded-xl` com background sutil |

---

## Arquivos a Modificar

### `src/components/ui/WelcomeTutorial.tsx`
- Aumentar `rounded-3xl` para `rounded-[2rem]` no ícone da intro
- Aumentar `rounded-2xl` para `rounded-3xl` nos ícones dos passos
- Melhorar botão "Pular" com background arredondado
- Aumentar progress dots de `w-2 h-2` para `w-2.5 h-2.5`
- Adicionar mais padding e espaçamento para visual mais "arejado"

### `src/components/ui/PrimaryButton.tsx`
- Alterar `rounded-lg` para `rounded-2xl` para bordas mais suaves

---

## Detalhes Técnicos

```text
Antes:
┌──────────────────────┐
│  rounded-lg (8px)    │  <- Botão
└──────────────────────┘

Depois:
╭──────────────────────╮
│  rounded-2xl (16px)  │  <- Botão mais suave
╰──────────────────────╯
```

### Mudanças Específicas no WelcomeTutorial:

1. **Ícone da Intro (Smartphone)**
   - De: `w-28 h-28 rounded-3xl`
   - Para: `w-32 h-32 rounded-[2rem]` (maior e mais arredondado)

2. **Ícone dos Passos**
   - De: `w-24 h-24 rounded-2xl`
   - Para: `w-28 h-28 rounded-3xl` (mais arredondado)

3. **Botão Pular**
   - De: `text-sm text-muted-foreground`
   - Para: `px-4 py-2 rounded-xl bg-muted/50 text-sm` (com fundo sutil)

4. **Progress Dots**
   - De: `w-2 h-2 rounded-full`
   - Para: `w-2.5 h-2.5 rounded-full` (ligeiramente maior)

5. **Footer**
   - De: `p-6 pb-8`
   - Para: `p-6 pb-10` (mais espaço inferior)

---

## Resultado Esperado
- Visual mais moderno e "app-like"
- Bordas super suaves em todos os elementos interativos
- Consistência com o design system minimalista do app
- Melhor experiência tátil em dispositivos móveis
