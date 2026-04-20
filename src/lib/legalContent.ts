/**
 * Conteúdo legal oficial Já Limpo — validado juridicamente.
 * Última atualização: 20 de abril de 2026
 */

export const LEGAL_LAST_UPDATE = "20 de abril de 2026";

export interface LegalSection {
  title: string;
  paragraphs: (string | { type: "list"; items: string[] } | { type: "highlight"; text: string })[];
}

export interface LegalDocument {
  id: string;
  title: string;
  shortTitle: string;
  sections: LegalSection[];
}

export const TERMS_PLATFORM: LegalDocument = {
  id: "platform",
  title: "Termos de Uso da Plataforma",
  shortTitle: "Plataforma",
  sections: [
    {
      title: "1. Apresentação e Aceite",
      paragraphs: [
        "O presente Termo de Uso regula o acesso e a utilização da plataforma digital denominada Já Limpo, de titularidade de JÁLIMPO TECNOLOGIA E INTERMEDIAÇÃO DE SERVIÇOS LTDA, estabelecendo as condições aplicáveis aos usuários, sejam eles contratantes de serviços ou profissionais autônomos cadastrados.",
        "Ao realizar cadastro, acessar ou utilizar a plataforma, o usuário declara ter lido, compreendido e aceitado integralmente as disposições aqui previstas, bem como das políticas complementares a este instrumento vinculadas.",
        "O aceite eletrônico possui plena validade jurídica, produzindo efeitos equivalentes aos de assinatura física, nos termos da legislação vigente.",
      ],
    },
    {
      title: "2. Definições",
      paragraphs: [
        "Para fins deste instrumento, adotam-se as seguintes definições:",
        {
          type: "list",
          items: [
            "Plataforma: sistema digital disponibilizado pelo Já Limpo para intermediação de serviços.",
            "Usuário: qualquer pessoa que utilize a plataforma, incluindo contratantes e profissionais.",
            "Contratante: usuário que solicita serviços por meio da plataforma.",
            "Profissional: prestador de serviços autônomo que se cadastra para oferecer serviços.",
            "Serviço: atividade de limpeza ou correlata contratada por meio da plataforma.",
          ],
        },
      ],
    },
    {
      title: "3. Natureza da Plataforma",
      paragraphs: [
        "A plataforma Já Limpo consiste em ambiente tecnológico de intermediação, destinado a conectar contratantes a profissionais autônomos, não atuando como prestadora direta dos serviços ofertados. Os serviços são executados exclusivamente pelos profissionais cadastrados, que atuam por conta própria, assumindo integral responsabilidade por sua atividade.",
        "Não há relação de emprego, subordinação jurídica ou vínculo trabalhista entre a plataforma e os profissionais, os quais possuem liberdade para definir sua disponibilidade, aceitar ou recusar serviços e organizar sua atuação de forma independente.",
        "A plataforma não exerce controle direto sobre a execução dos serviços, limitando-se a disponibilizar ferramentas tecnológicas para facilitar a contratação.",
      ],
    },
    {
      title: "4. Cadastro e Responsabilidade dos Usuários",
      paragraphs: [
        "O acesso à plataforma depende de cadastro prévio, mediante fornecimento de informações verídicas, completas e atualizadas. O usuário é responsável pela veracidade dos dados informados, bem como pela guarda de suas credenciais de acesso, não sendo permitido o compartilhamento de conta com terceiros.",
        "A utilização indevida da conta ou a prestação de informações falsas poderá ensejar suspensão ou exclusão do usuário, sem prejuízo de responsabilização legal.",
      ],
    },
    {
      title: "5. Verificação de Antecedentes e Segurança",
      paragraphs: [
        "A Plataforma poderá, a seu exclusivo critério e periodicamente, realizar verificações de antecedentes criminais, consulta a bancos de dados públicos e privados, e checagem de documentos dos Profissionais cadastrados, como medida de segurança e mitigação de riscos.",
        {
          type: "highlight",
          text: "O Contratante reconhece e concorda que tais verificações não garantem a idoneidade absoluta ou a ausência de riscos na contratação de qualquer Profissional, sendo de sua exclusiva responsabilidade a avaliação e decisão de contratar os serviços.",
        },
        "A Plataforma não se responsabiliza por atos ou omissões dos Profissionais, nem por quaisquer danos que possam ser causados por eles, uma vez que atuam de forma autônoma e independente.",
      ],
    },
    {
      title: "6. Funcionamento da Plataforma",
      paragraphs: [
        "A plataforma permite que o contratante selecione o tipo de serviço desejado, defina data, horário e local, realizando o pagamento antecipado por meio das opções disponibilizadas. Após a solicitação, o serviço poderá ser aceito por profissional autônomo cadastrado, que decidirá livremente sobre sua participação.",
        "A execução do serviço ocorre diretamente entre contratante e profissional, cabendo à plataforma apenas a intermediação tecnológica. A confirmação da conclusão do serviço pelo contratante autoriza o repasse do valor ao profissional, descontada a comissão da plataforma.",
      ],
    },
    {
      title: "7. Pagamentos e Repasses",
      paragraphs: [
        "O pagamento pelos serviços será realizado antecipadamente pelo contratante, permanecendo o valor retido pela plataforma até a conclusão do serviço. Após a confirmação da execução, a plataforma realizará o repasse ao profissional, deduzindo a comissão previamente estabelecida.",
        "A retenção temporária do valor tem como finalidade garantir segurança à transação e permitir a mediação de eventuais conflitos.",
        "A plataforma não se responsabiliza por eventuais encargos tributários incidentes sobre a remuneração dos profissionais, os quais são integralmente responsáveis por suas obrigações fiscais.",
      ],
    },
    {
      title: "8. Cancelamento e Reembolso",
      paragraphs: [
        "O Contratante poderá cancelar o serviço agendado por meio da Plataforma, observando-se as condições detalhadas na Política de Cancelamento e Reembolso, parte integrante destes Termos.",
        {
          type: "list",
          items: [
            "Cancelamento sem custo: com antecedência mínima de 3 horas, valor integralmente reembolsado.",
            "Cancelamento com multa: menos de 3 horas, multa de 20% (10% Plataforma + 10% Profissional).",
            "No horário ou após o início: sem reembolso.",
          ],
        },
        "Situações excepcionais, como casos de força maior ou caso fortuito devidamente comprovados, poderão ser analisadas pela Plataforma, conforme critérios de razoabilidade e boa-fé.",
      ],
    },
    {
      title: "9. Direito de Arrependimento",
      paragraphs: [
        "O Contratante poderá exercer o direito de arrependimento da contratação do serviço, no prazo de 7 (sete) dias a contar da data da contratação, nos termos do artigo 49 do Código de Defesa do Consumidor.",
        "Contudo, o direito de arrependimento não será aplicável caso o serviço já tenha sido integralmente prestado ou iniciado antes do término do prazo de 7 (sete) dias, mediante solicitação expressa do Contratante para que a execução ocorresse de forma imediata.",
      ],
    },
    {
      title: "10. Responsabilidades das Partes",
      paragraphs: [
        "O Contratante é responsável por fornecer condições adequadas para a execução do serviço, incluindo acesso ao local, informações corretas e ambiente seguro. Também se responsabiliza por quaisquer danos causados ao Profissional ou a terceiros por sua culpa ou de pessoas sob sua responsabilidade.",
        {
          type: "highlight",
          text: "A Plataforma não se responsabiliza por quaisquer danos materiais ou pessoais que possam ocorrer durante a prestação dos serviços, sendo a responsabilidade exclusiva do Profissional. Recomenda-se que o Profissional possua seguro de responsabilidade civil.",
        },
      ],
    },
    {
      title: "11. Código de Conduta",
      paragraphs: [
        "Os usuários comprometem-se a utilizar a plataforma de forma ética, respeitosa e conforme a legislação vigente. É expressamente proibido:",
        {
          type: "list",
          items: [
            "Qualquer forma de assédio ou comportamento inadequado.",
            "Utilização da plataforma para fins ilícitos.",
            "Tentativa de burlar o sistema de intermediação.",
          ],
        },
        "A violação destas regras poderá resultar em suspensão ou exclusão da conta.",
      ],
    },
    {
      title: "12. Proibição de Pagamento Fora da Plataforma",
      paragraphs: [
        "A utilização da plataforma Já Limpo implica concordância expressa de que todos os serviços contratados por meio do ambiente digital deverão ser integralmente formalizados e pagos dentro da própria plataforma, vedando-se a realização de transações diretas entre contratante e profissional fora do sistema.",
        "A plataforma poderá adotar mecanismos tecnológicos e operacionais destinados à identificação de práticas que indiquem tentativa de burla ao sistema de intermediação.",
      ],
    },
    {
      title: "13. Limitação de Responsabilidade",
      paragraphs: [
        "A plataforma Já Limpo atua exclusivamente como intermediadora tecnológica, não sendo responsável pela execução direta dos serviços contratados entre usuários. A responsabilidade pela prestação do serviço, incluindo qualidade, pontualidade, adequação técnica e eventuais danos decorrentes da execução, é exclusiva do profissional autônomo contratado.",
        "A plataforma não garante resultado específico quanto aos serviços prestados, tampouco se responsabiliza por eventuais insatisfações subjetivas do contratante, desde que o serviço tenha sido executado dentro dos parâmetros mínimos razoáveis.",
      ],
    },
    {
      title: "14. Suspensão, Bloqueio e Exclusão",
      paragraphs: [
        "A plataforma poderá, a seu critério, suspender temporariamente ou excluir definitivamente usuários que violem as disposições destes Termos, das políticas vinculadas ou da legislação aplicável. São hipóteses exemplificativas:",
        {
          type: "list",
          items: [
            "Prática de fraude ou tentativa de fraude.",
            "Descumprimento reiterado de regras de conduta.",
            "Utilização indevida da plataforma.",
            "Tentativa de burlar o sistema de pagamentos.",
            "Comportamento que comprometa a segurança ou a reputação da plataforma.",
          ],
        },
      ],
    },
    {
      title: "15. Proteção de Dados Pessoais",
      paragraphs: [
        "O tratamento de dados pessoais dos usuários será realizado em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD), e com a Política de Privacidade da Plataforma, parte integrante e indissociável destes Termos.",
        "O usuário possui direito de acesso, correção, exclusão, portabilidade, anonimização, bloqueio e oposição ao tratamento de seus dados, podendo exercê-los por meio dos canais de atendimento da Plataforma.",
      ],
    },
    {
      title: "16. Mediação de Conflitos e Foro",
      paragraphs: [
        "Os usuários comprometem-se a envidar esforços para resolução amigável de quaisquer divergências, priorizando o diálogo e a preservação da boa relação na Plataforma.",
        "Fica eleito o foro da Comarca da sede da Plataforma para dirimir quaisquer questões decorrentes destes Termos de Uso, com renúncia expressa a qualquer outro, por mais privilegiado que seja.",
      ],
    },
    {
      title: "17. Disposições Finais",
      paragraphs: [
        "A plataforma poderá atualizar os presentes Termos de Uso a qualquer tempo, mediante disponibilização da versão atualizada em seu ambiente digital. O uso contínuo da plataforma após a atualização será interpretado como concordância com as novas disposições.",
      ],
    },
  ],
};

export const TERMS_CLIENT: LegalDocument = {
  id: "client",
  title: "Termos de Uso do Contratante",
  shortTitle: "Contratante",
  sections: [
    {
      title: "1. Objeto e Finalidade",
      paragraphs: [
        "O presente Termo regula as condições de utilização da plataforma Já Limpo pelo usuário na qualidade de contratante de serviços, estabelecendo direitos, deveres e responsabilidades no âmbito da contratação de serviços de limpeza intermediados pela plataforma.",
        "Ao utilizar a plataforma, o contratante declara estar ciente de que o Já Limpo atua exclusivamente como intermediador tecnológico, sendo os serviços executados por profissionais autônomos, sem vínculo com a empresa.",
      ],
    },
    {
      title: "2. Natureza da Relação",
      paragraphs: [
        "A relação entre o Contratante e a Plataforma é de consumo no que tange à intermediação tecnológica. Contudo, a Plataforma não possui qualquer responsabilidade pela execução direta dos serviços de limpeza, que são de responsabilidade exclusiva do Profissional autônomo contratado.",
        "Eventuais obrigações relacionadas à execução do serviço são de responsabilidade do profissional contratado, observadas as condições previamente estabelecidas.",
      ],
    },
    {
      title: "3. Cadastro e Responsabilidade",
      paragraphs: [
        "O contratante deverá realizar cadastro mediante fornecimento de dados verídicos, completos e atualizados. A conta é de uso pessoal, sendo vedado o compartilhamento de acesso com terceiros.",
        "O contratante será responsável por qualquer atividade realizada por meio de sua conta, inclusive em caso de uso indevido decorrente de negligência na guarda de suas credenciais.",
      ],
    },
    {
      title: "4. Solicitação dos Serviços",
      paragraphs: [
        "O contratante poderá selecionar o tipo de serviço desejado, bem como informar data, horário, local e demais condições relevantes para a execução. As informações fornecidas deverão refletir fielmente a realidade do local e das necessidades do serviço.",
        "A solicitação não garante aceitação imediata por profissional, estando sujeita à disponibilidade na plataforma. Eventuais inconsistências nas informações poderão impactar o resultado do serviço.",
      ],
    },
    {
      title: "5. Verificação de Identidade do Profissional",
      paragraphs: [
        "A Plataforma poderá realizar verificações de antecedentes e checagem de documentos dos Profissionais cadastrados.",
        {
          type: "highlight",
          text: "Para sua própria segurança, o Contratante deve conferir a identidade do Profissional ao recebê-lo no local, utilizando as informações e fotos disponibilizadas na Plataforma.",
        },
      ],
    },
    {
      title: "6. Condições para Execução",
      paragraphs: [
        "O contratante compromete-se a garantir condições adequadas para a execução do serviço, incluindo:",
        {
          type: "list",
          items: [
            "Acesso ao local no horário agendado.",
            "Ambiente seguro e compatível com a atividade.",
            "Disponibilidade de recursos mínimos necessários, quando aplicável.",
          ],
        },
        "A ausência de condições adequadas poderá inviabilizar a execução do serviço, não sendo imputável ao profissional eventual impossibilidade decorrente de tais circunstâncias.",
      ],
    },
    {
      title: "7. Pagamentos",
      paragraphs: [
        "O pagamento pelo serviço será realizado de forma antecipada por meio da plataforma, permanecendo retido até a conclusão do serviço. A confirmação da execução pelo contratante autoriza o repasse do valor ao profissional, descontadas eventuais taxas da plataforma.",
      ],
    },
    {
      title: "8. Cancelamento e Reembolso",
      paragraphs: [
        "O Contratante poderá cancelar o serviço agendado pela Plataforma:",
        {
          type: "list",
          items: [
            "Sem custo: antecedência mínima de 3 horas, reembolso integral.",
            "Com multa de 20%: menos de 3 horas (10% Plataforma + 10% Profissional).",
            "No horário ou após o início: sem reembolso.",
          ],
        },
        "Direito de arrependimento: 7 dias a contar da contratação (art. 49 CDC), salvo se o serviço já tiver sido prestado mediante solicitação expressa de execução imediata.",
      ],
    },
    {
      title: "9. Relação com o Profissional",
      paragraphs: [
        "O contratante compromete-se a manter comportamento respeitoso, ético e compatível com a natureza da prestação de serviços. É vedada qualquer forma de assédio, discriminação ou tratamento inadequado ao profissional.",
        "A contratação não implica qualquer relação de subordinação entre contratante e profissional, devendo ser respeitada a autonomia deste.",
      ],
    },
    {
      title: "10. Proibição de Pagamento Fora da Plataforma",
      paragraphs: [
        "O contratante compromete-se a não realizar, incentivar ou aceitar qualquer forma de pagamento direto ao profissional por serviços originados ou intermediados pela plataforma Já Limpo, devendo todas as transações ocorrer exclusivamente por meio do sistema disponibilizado.",
        "O descumprimento poderá ensejar advertência, suspensão temporária, bloqueio definitivo da conta e eventual responsabilização por perdas e danos.",
      ],
    },
    {
      title: "11. Avaliações",
      paragraphs: [
        "O contratante poderá avaliar o serviço prestado pelo profissional após a sua conclusão. As avaliações deverão refletir a experiência real do contratante, sendo vedada a inserção de informações falsas, ofensivas, abusivas ou desproporcionais.",
        "A utilização indevida do sistema de avaliações poderá ensejar a adoção de medidas pela plataforma, incluindo remoção de conteúdo, restrições de uso e eventual suspensão da conta.",
      ],
    },
    {
      title: "12. Responsabilidades do Contratante",
      paragraphs: [
        "Incluem-se, dentre as responsabilidades do contratante:",
        {
          type: "list",
          items: [
            "A veracidade das informações prestadas.",
            "A adequação do ambiente para execução do serviço.",
            "A garantia de acesso ao local no horário agendado.",
            "A preservação da integridade física e moral do profissional.",
            "A guarda de objetos de valor, dinheiro em espécie, joias e outros bens de alto valor.",
          ],
        },
        {
          type: "highlight",
          text: "A Plataforma não se responsabiliza por perdas, furtos ou danos a itens não inventariados ou deixados sem a devida segurança.",
        },
      ],
    },
    {
      title: "13. Limitação de Responsabilidade da Plataforma",
      paragraphs: [
        "A plataforma Já Limpo atua exclusivamente como intermediadora tecnológica. A responsabilidade pela prestação do serviço, incluindo qualidade, pontualidade, adequação técnica e eventuais danos, é exclusiva do profissional autônomo contratado.",
        "Em nenhuma hipótese a responsabilidade da Plataforma excederá o valor da comissão recebida pela Plataforma no serviço específico que gerou o dano, salvo nos casos de dolo ou culpa grave comprovados.",
      ],
    },
    {
      title: "14. Suspensão e Exclusão",
      paragraphs: [
        "A plataforma poderá suspender ou excluir contratantes em hipóteses como prática de fraude, descumprimento reiterado das regras, comportamento inadequado em relação a profissionais, tentativa de burlar o sistema de pagamentos ou utilização indevida da plataforma.",
      ],
    },
    {
      title: "15. Disposições Finais",
      paragraphs: [
        "Fica eleito o foro da Comarca da sede da Plataforma para dirimir quaisquer questões decorrentes destes Termos de Uso, com renúncia expressa a qualquer outro, por mais privilegiado que seja.",
      ],
    },
  ],
};

export const TERMS_PRO: LegalDocument = {
  id: "pro",
  title: "Termos de Uso do Profissional (Diarista)",
  shortTitle: "Profissional",
  sections: [
    {
      title: "1. Objeto e Finalidade",
      paragraphs: [
        "O presente Termo regula as condições de cadastro, acesso e utilização da plataforma Já Limpo por profissionais autônomos interessados em ofertar serviços de limpeza aos usuários contratantes.",
        "Ao aderir a este Termo, o profissional declara que compreende a natureza da plataforma como ambiente de intermediação tecnológica, comprometendo-se a utilizá-la de acordo com as disposições aqui previstas.",
      ],
    },
    {
      title: "2. Natureza da Relação e Autonomia",
      paragraphs: [
        "O profissional declara, para todos os fins, que atua de forma autônoma, independente e por sua conta e risco, não mantendo qualquer vínculo empregatício, societário ou de subordinação com a plataforma.",
        {
          type: "highlight",
          text: "A utilização da plataforma não implica relação de emprego, não estando presentes os elementos caracterizadores da relação trabalhista, especialmente subordinação jurídica, habitualidade obrigatória ou controle direto da atividade.",
        },
        "O profissional possui liberdade para definir sua agenda, disponibilidade, áreas de atuação e interesse na aceitação de serviços, podendo livremente aceitar ou recusar solicitações.",
        "O Profissional reconhece que é o único responsável pela aquisição, manutenção e utilização de seus próprios materiais, ferramentas e equipamentos necessários à prestação dos serviços, salvo acordo expresso com o Contratante.",
      ],
    },
    {
      title: "3. Cadastro e Manutenção da Conta",
      paragraphs: [
        "O profissional deverá realizar cadastro mediante fornecimento de informações verídicas, completas e atualizadas. A conta é pessoal e intransferível.",
        "O Profissional poderá, mediante prévia comunicação e aprovação da Plataforma, fazer-se substituir por outro Profissional devidamente cadastrado, desde que este possua as qualificações necessárias e o Contratante seja previamente informado e concorde.",
      ],
    },
    {
      title: "4. Aceitação e Execução dos Serviços",
      paragraphs: [
        "Os serviços disponibilizados na plataforma poderão ser livremente aceitos ou recusados pelo profissional, não havendo obrigação mínima de aceitação ou permanência ativa.",
        "Uma vez aceito o serviço, o profissional compromete-se a executá-lo com diligência, pontualidade e observância das condições previamente informadas.",
        "A recusa de serviços não enseja penalidade, salvo em casos de comportamento reiterado que comprometa a confiabilidade do sistema.",
      ],
    },
    {
      title: "5. Obrigações do Profissional",
      paragraphs: [
        "O profissional compromete-se a:",
        {
          type: "list",
          items: [
            "Atuar com zelo, respeito e profissionalismo.",
            "Cumprir os serviços aceitos nas condições ajustadas.",
            "Manter comunicação adequada com o contratante.",
            "Respeitar as normas de conduta da plataforma.",
            "Não praticar qualquer ato ilícito ou abusivo.",
          ],
        },
      ],
    },
    {
      title: "6. Pagamentos e Remuneração",
      paragraphs: [
        "A remuneração será definida pelo Profissional dentro das faixas de preço ou categorias disponibilizadas na plataforma. O pagamento será realizado pelo Contratante de forma antecipada e retido pela Plataforma até a conclusão do serviço.",
        "Após a confirmação da execução, a Plataforma realizará o repasse ao Profissional, descontando a comissão previamente estabelecida e informada.",
        {
          type: "highlight",
          text: "O Profissional é integralmente responsável por sua regularização tributária e previdenciária. Recomenda-se fortemente a formalização como MEI para garantir direitos previdenciários e fiscais.",
        },
      ],
    },
    {
      title: "7. Proibição de Negociação Fora da Plataforma",
      paragraphs: [
        "O profissional compromete-se a não realizar, incentivar ou aceitar pagamentos fora da plataforma para serviços originados por meio do Já Limpo.",
        "O descumprimento poderá ensejar bloqueio imediato da conta, perda de valores pendentes e demais medidas cabíveis.",
      ],
    },
    {
      title: "8. Avaliação e Desempenho",
      paragraphs: [
        "Os serviços prestados poderão ser avaliados pelos Contratantes, compondo um histórico de desempenho do Profissional na Plataforma.",
        "Avaliações negativas reiteradas ou o descumprimento das regras poderão impactar a visibilidade do Profissional. Em casos graves, a Plataforma poderá aplicar suspensão temporária ou exclusão definitiva, garantido o direito de manifestação prévia.",
      ],
    },
    {
      title: "9. Não Exclusividade",
      paragraphs: [
        "O profissional poderá exercer suas atividades por outros meios, plataformas ou de forma independente, não havendo qualquer exigência de exclusividade.",
      ],
    },
    {
      title: "10. Responsabilidade do Profissional",
      paragraphs: [
        "O Profissional assume integral responsabilidade por quaisquer danos materiais, pessoais ou morais que venha a causar ao Contratante, a terceiros ou ao patrimônio do Contratante durante a prestação dos serviços, por sua culpa ou dolo.",
        "Recomenda-se que o Profissional contrate seguro de responsabilidade civil para cobertura de eventuais danos a terceiros, bem como seguro de acidentes pessoais.",
      ],
    },
    {
      title: "11. Suspensão e Exclusão",
      paragraphs: [
        "A plataforma poderá suspender ou excluir o profissional em caso de:",
        {
          type: "list",
          items: [
            "Descumprimento destes Termos.",
            "Prática de fraude.",
            "Comportamento inadequado.",
            "Tentativa de burlar o sistema.",
            "Prejuízo à reputação da plataforma.",
          ],
        },
      ],
    },
    {
      title: "12. Confidencialidade",
      paragraphs: [
        "O profissional compromete-se a manter sigilo sobre informações obtidas durante a utilização da plataforma ou execução dos serviços.",
      ],
    },
    {
      title: "13. Disposições Finais",
      paragraphs: [
        "Fica eleito o foro da Comarca da sede da Plataforma para dirimir quaisquer questões decorrentes destes Termos de Uso.",
      ],
    },
  ],
};

export const POLICY_CANCELLATION: LegalDocument = {
  id: "cancellation",
  title: "Política de Cancelamento e Reembolso",
  shortTitle: "Cancelamento",
  sections: [
    {
      title: "1. Finalidade e Abrangência",
      paragraphs: [
        "A presente Política tem por finalidade estabelecer as regras aplicáveis às hipóteses de cancelamento de serviços intermediados pela plataforma Já Limpo, bem como os critérios para eventual devolução de valores, compensação de profissionais e tratamento de situações excepcionais.",
        "Esta política integra os Termos de Uso da plataforma, aplicando-se a todos os usuários, sejam contratantes ou profissionais.",
      ],
    },
    {
      title: "2. Natureza do Pagamento e Retenção",
      paragraphs: [
        "Os serviços contratados são pagos antecipadamente pelo contratante, permanecendo o valor retido até a conclusão do serviço. A retenção tem por finalidade garantir a segurança da operação e viabilizar a mediação de eventuais conflitos.",
      ],
    },
    {
      title: "3. Cancelamento pelo Contratante",
      paragraphs: [
        {
          type: "highlight",
          text: "Sem custo (≥ 3h de antecedência): valor integralmente reembolsado, sem qualquer penalidade.",
        },
        {
          type: "highlight",
          text: "Multa parcial 20% (entre 1h e 3h): 10% retido pela Plataforma, 10% repassado ao Profissional como compensação.",
        },
        {
          type: "highlight",
          text: "Multa integral (< 1h ou No-Show): valor integral repassado ao Profissional, descontada a comissão da Plataforma.",
        },
        "A aplicação das multas poderá ser revista em situações excepcionais, como casos de força maior ou caso fortuito devidamente comprovados.",
      ],
    },
    {
      title: "4. Reagendamento",
      paragraphs: [
        "Reagendamento sem custo: solicitado com antecedência mínima de 12 horas, sujeito à disponibilidade.",
        "Reagendamento com taxa: solicitado em menos de 12 horas, taxa de 10% do valor do serviço a título de compensação operacional.",
      ],
    },
    {
      title: "5. Cancelamento pelo Profissional",
      paragraphs: [
        "O Profissional poderá cancelar o serviço previamente aceito, recomendando-se prazo mínimo de 3 horas para evitar transtornos ao Contratante.",
        "Cancelamentos injustificados, especialmente com antecedência inferior a 3 horas, ou cancelamentos reiterados, poderão impactar negativamente a reputação do Profissional, ensejar restrição de acesso, suspensão temporária ou exclusão definitiva.",
        "Nos casos em que o cancelamento comprometa a substituição por outro prestador, a Plataforma poderá oferecer ao Contratante um crédito ou desconto em nova contratação.",
      ],
    },
    {
      title: "6. Não Comparecimento (No-Show)",
      paragraphs: [
        "Considera-se No-Show a ausência injustificada de qualquer das partes no horário agendado, ou a impossibilidade de acesso ao local por parte do Profissional.",
        "Profissional ausente: o Contratante poderá solicitar reembolso integral ou reagendamento.",
        "Contratante ausente (após 15 min de tolerância): o Profissional estará desobrigado e o valor pago será integralmente repassado, descontada a comissão.",
      ],
    },
    {
      title: "7. Interrupção ou Execução Parcial",
      paragraphs: [
        "Casos de interrupção ou execução parcial serão analisados pela plataforma, considerando as circunstâncias concretas e responsabilidades.",
        "Se a interrupção decorrer de conduta do profissional, o contratante poderá ter direito a reembolso total ou parcial. Se decorrer de fatores atribuíveis ao contratante, poderá ser aplicada compensação ao profissional.",
      ],
    },
    {
      title: "8. Reembolso",
      paragraphs: [
        "Os reembolsos serão realizados por meio do mesmo instrumento de pagamento utilizado pelo Contratante, podendo haver variação de prazo conforme as políticas da operadora financeira.",
        "Os valores eventualmente retidos a título de multa ou compensação não serão objeto de reembolso. A Plataforma poderá deduzir custos de transação ou taxas administrativas.",
      ],
    },
    {
      title: "9. Situações Excepcionais",
      paragraphs: [
        "A plataforma poderá flexibilizar as regras desta Política em situações excepcionais, incluindo:",
        {
          type: "list",
          items: [
            "Eventos de força maior.",
            "Problemas de saúde devidamente comprovados.",
            "Falhas técnicas da plataforma.",
            "Situações imprevisíveis que inviabilizem a execução do serviço.",
          ],
        },
      ],
    },
    {
      title: "10. Mediação de Conflitos",
      paragraphs: [
        "Eventuais divergências relacionadas a cancelamentos, reembolsos ou execução dos serviços poderão ser submetidas à mediação da Plataforma, mediante apresentação de evidências (registros do chat, fotos, comprovantes).",
        "A decisão da Plataforma terá caráter administrativo, sem prejuízo do direito das partes de buscar as vias judiciais cabíveis.",
      ],
    },
  ],
};

export const PRIVACY_POLICY: LegalDocument = {
  id: "privacy",
  title: "Política de Privacidade",
  shortTitle: "Privacidade",
  sections: [
    {
      title: "1. Disposições Gerais e Finalidade",
      paragraphs: [
        "A presente Política de Privacidade tem por finalidade estabelecer as diretrizes relativas ao tratamento de dados pessoais dos usuários da plataforma Já Limpo, em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD).",
        "A controladora dos dados pessoais é a JÁLIMPO TECNOLOGIA E INTERMEDIAÇÃO DE SERVIÇOS LTDA. A JáLimpo nomeou um Encarregado pelo Tratamento de Dados Pessoais (DPO), que pode ser contatado pelos canais oficiais da plataforma.",
      ],
    },
    {
      title: "2. Dados Coletados",
      paragraphs: [
        "A plataforma poderá coletar e tratar diferentes categorias de dados pessoais:",
        {
          type: "list",
          items: [
            "Dados de identificação (nome completo, CPF, documentos).",
            "Dados de contato (telefone, e-mail).",
            "Dados de localização (endereço, geolocalização para execução do serviço).",
            "Dados financeiros (informações de pagamento, transações).",
            "Dados de uso da plataforma (histórico, avaliações, interações).",
            "Dados técnicos (IP, dispositivo, sistema operacional).",
          ],
        },
        {
          type: "highlight",
          text: "A plataforma Já Limpo não se destina a menores de 18 anos. Caso seja detectado cadastro de menor, a conta e dados serão imediatamente excluídos.",
        },
      ],
    },
    {
      title: "3. Finalidades do Tratamento",
      paragraphs: [
        "Os dados pessoais serão tratados para finalidades legítimas, específicas e informadas:",
        {
          type: "list",
          items: [
            "Viabilizar o cadastro e autenticação na plataforma.",
            "Permitir a intermediação de serviços entre contratantes e profissionais.",
            "Processar pagamentos e repasses.",
            "Possibilitar comunicação entre usuários.",
            "Garantir segurança da operação e prevenção de fraudes.",
            "Melhorar a experiência do usuário e o desempenho da plataforma.",
            "Cumprir obrigações legais e regulatórias.",
          ],
        },
      ],
    },
    {
      title: "4. Bases Legais",
      paragraphs: [
        "O tratamento fundamenta-se nas bases legais previstas na LGPD, especialmente:",
        {
          type: "list",
          items: [
            "Execução de contrato ou procedimentos preliminares.",
            "Cumprimento de obrigação legal ou regulatória.",
            "Legítimo interesse da plataforma.",
            "Consentimento do titular, quando aplicável.",
          ],
        },
      ],
    },
    {
      title: "5. Compartilhamento de Dados",
      paragraphs: [
        "Os dados pessoais poderão ser compartilhados com terceiros quando necessário à execução dos serviços:",
        {
          type: "list",
          items: [
            "Intermediadores de pagamento.",
            "Ferramentas de comunicação.",
            "Serviços de geolocalização e mapas.",
            "Prestadores de serviços tecnológicos.",
            "Entre usuários (Contratantes e Profissionais), apenas dados estritamente necessários.",
          ],
        },
        {
          type: "highlight",
          text: "A plataforma não comercializa dados pessoais dos usuários. O compartilhamento será sempre limitado ao estritamente necessário, em conformidade com a LGPD.",
        },
        "A JáLimpo poderá armazenar dados em servidores localizados fora do território brasileiro, por meio de serviços de computação em nuvem, garantindo padrões de segurança compatíveis com a legislação brasileira.",
      ],
    },
    {
      title: "6. Armazenamento e Segurança",
      paragraphs: [
        "Os dados pessoais serão armazenados em ambientes seguros, com a adoção de medidas técnicas e administrativas aptas a protegê-los contra acessos não autorizados, perda, alteração ou destruição indevida.",
        "O acesso aos dados é restrito a pessoas autorizadas e condicionado à necessidade para execução das atividades.",
      ],
    },
    {
      title: "7. Incidente de Segurança",
      paragraphs: [
        "Em caso de incidente de segurança que possa acarretar risco ou dano relevante aos titulares, a JáLimpo se compromete a notificar a Autoridade Nacional de Proteção de Dados (ANPD) e os titulares afetados, conforme exigido pela legislação, e a adotar as medidas cabíveis para mitigar os danos.",
      ],
    },
    {
      title: "8. Tempo de Retenção",
      paragraphs: [
        "Os dados pessoais serão mantidos pelo tempo necessário ao cumprimento das finalidades para as quais foram coletados, bem como para atendimento de obrigações legais, regulatórias e contratuais.",
        "Após o término do tratamento, os dados poderão ser eliminados ou anonimizados, ressalvadas hipóteses legais de retenção.",
      ],
    },
    {
      title: "9. Direitos do Titular",
      paragraphs: [
        "Nos termos da LGPD, o usuário possui os seguintes direitos:",
        {
          type: "list",
          items: [
            "Confirmação da existência de tratamento.",
            "Acesso aos dados.",
            "Correção de dados incompletos ou desatualizados.",
            "Anonimização, bloqueio ou eliminação de dados desnecessários.",
            "Portabilidade dos dados.",
            "Revogação do consentimento, quando aplicável.",
          ],
        },
        "O exercício dos direitos poderá ser solicitado por meio dos canais de atendimento da plataforma.",
      ],
    },
    {
      title: "10. Cookies e Tecnologias Similares",
      paragraphs: [
        "A plataforma poderá utilizar cookies e tecnologias similares para melhorar a experiência do usuário, analisar comportamento de navegação e aprimorar funcionalidades.",
        "O usuário poderá gerenciar preferências relacionadas a cookies por meio das configurações do dispositivo ou navegador. A desativação poderá impactar o funcionamento de determinadas funcionalidades.",
      ],
    },
    {
      title: "11. Responsabilidade do Usuário",
      paragraphs: [
        "O usuário é responsável pela veracidade das informações fornecidas e pela utilização adequada da plataforma. A inserção de dados incorretos ou de terceiros sem autorização poderá implicar responsabilização nos termos da legislação aplicável.",
      ],
    },
    {
      title: "12. Alterações da Política",
      paragraphs: [
        "A presente Política poderá ser atualizada a qualquer tempo, mediante disponibilização de nova versão na plataforma. A continuidade do uso após a atualização será interpretada como concordância.",
      ],
    },
    {
      title: "13. Contato",
      paragraphs: [
        "O usuário poderá entrar em contato com a plataforma para esclarecimentos, solicitações ou exercício de direitos relacionados à proteção de dados pessoais por meio dos canais oficiais disponibilizados.",
      ],
    },
  ],
};

export const ALL_TERMS = [TERMS_PLATFORM, TERMS_CLIENT, TERMS_PRO, POLICY_CANCELLATION];
