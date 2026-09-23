import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/db";
import { formatarData, formatarReal } from "@/lib/format";
import {
  ITENS_INCLUIDOS,
  ITENS_EXCLUIDOS,
  APRESENTACAO_EXPERIENCIA,
  NOTA_SINAL,
  calcularSinal,
  propostaVisivelAoCliente,
} from "@/lib/proposta";
import { DocumentoProposta } from "@/lib/pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { token: string } },
) {
  const proposta = await prisma.proposta.findUnique({
    where: { tokenAcesso: params.token },
    include: { solicitacao: { include: { cliente: true } } },
  });

  if (!proposta || !propostaVisivelAoCliente(proposta.status)) {
    return new NextResponse("Proposta não disponível.", { status: 404 });
  }

  const s = proposta.solicitacao;
  const c = s.cliente;
  const convidados =
    s.numAdultos + (s.temCriancas && s.numCriancas ? s.numCriancas : 0);
  const sinal = calcularSinal(proposta.valorTotal);

  const buffer = await renderToBuffer(
    DocumentoProposta({
      clienteNome: c.nome,
      ocasiao: s.ocasiao === "Outro" ? s.ocasiaoOutro ?? "Evento" : s.ocasiao,
      dataEvento: formatarData(s.dataEvento),
      convidados,
      apresentacao: APRESENTACAO_EXPERIENCIA,
      escopo: proposta.escopoDescricao,
      incluidos: ITENS_INCLUIDOS,
      excluidos: ITENS_EXCLUIDOS,
      valorTotal: formatarReal(proposta.valorTotal),
      condicoes: proposta.condicoesPagamento,
      validade: proposta.validadeAte ? formatarData(proposta.validadeAte) : null,
      notaSinal: NOTA_SINAL,
      sinal: sinal !== null ? formatarReal(sinal) : null,
      ressalvas: proposta.ressalvas,
    }),
  );

  const nome = `Proposta-SalTal-${c.nome.replace(/[^\p{L}\d]+/gu, "-")}.pdf`;
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${nome}"`,
      "Cache-Control": "no-store",
    },
  });
}
