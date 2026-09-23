import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Documento PDF da proposta (apenas dados visíveis ao cliente — sem custos).
// A marca é representada por wordmark em texto (fundo claro), evitando o logo
// de fundo escuro. Ao receber um PNG transparente do logo, dá para embuti-lo.

const VINHO = "#7d1f1d";
const TINTA = "#2a2420";
const SUAVE = "#6d6155";
const CREME = "#f6efe1";

const s = StyleSheet.create({
  page: { paddingTop: 46, paddingBottom: 46, paddingHorizontal: 46, fontSize: 10, color: TINTA, fontFamily: "Helvetica" },
  marca: { fontSize: 20, fontFamily: "Helvetica-Bold", letterSpacing: 2, color: VINHO },
  marcaSub: { fontSize: 8, letterSpacing: 3, color: SUAVE, marginTop: 2 },
  faixa: { marginTop: 22, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#e2d5bf" },
  rotulo: { fontSize: 8, letterSpacing: 2, color: VINHO, fontFamily: "Helvetica-Bold" },
  nome: { fontSize: 22, fontFamily: "Helvetica-Bold", marginTop: 6 },
  meta: { fontSize: 10, color: SUAVE, marginTop: 6 },
  secao: { marginTop: 20 },
  h2: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  paragrafo: { lineHeight: 1.5, color: TINTA },
  colunas: { flexDirection: "row", marginTop: 16 },
  coluna: { flex: 1, paddingRight: 12 },
  colTitulo: { fontSize: 8, letterSpacing: 1.5, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  item: { marginBottom: 4, lineHeight: 1.4 },
  valorBox: { marginTop: 20, backgroundColor: "#f7ecec", borderRadius: 6, padding: 16, borderWidth: 1, borderColor: "#e7cfcf" },
  valorLabel: { fontSize: 9, color: SUAVE },
  valor: { fontSize: 26, fontFamily: "Helvetica-Bold", color: VINHO, marginTop: 2 },
  cond: { marginTop: 8, fontSize: 10, color: TINTA, lineHeight: 1.4 },
  sinalBox: { marginTop: 16, backgroundColor: CREME, borderRadius: 6, padding: 14, borderWidth: 1, borderColor: "#e2d5bf" },
  ressalva: { marginTop: 18, fontSize: 8, color: SUAVE, lineHeight: 1.4 },
  rodape: { position: "absolute", bottom: 24, left: 46, right: 46, textAlign: "center", fontSize: 8, color: SUAVE, borderTopWidth: 1, borderTopColor: "#e2d5bf", paddingTop: 8 },
});

export interface DadosPDF {
  clienteNome: string;
  ocasiao: string;
  dataEvento: string;
  convidados: number;
  apresentacao: string;
  escopo?: string | null;
  incluidos: readonly string[];
  excluidos: readonly string[];
  valorTotal: string;
  condicoes?: string | null;
  validade?: string | null;
  notaSinal: string;
  sinal?: string | null;
  ressalvas?: string | null;
}

export function DocumentoProposta(d: DadosPDF) {
  return (
    <Document title={`Proposta - ${d.clienteNome}`} author="SAL & TAL - O Churrasco">
      <Page size="A4" style={s.page}>
        <View>
          <Text style={s.marca}>SAL &amp; TAL</Text>
          <Text style={s.marcaSub}>O CHURRASCO</Text>
        </View>

        <View style={s.faixa}>
          <Text style={s.rotulo}>PROPOSTA DE CHURRASCO PREMIUM</Text>
          <Text style={s.nome}>{d.clienteNome}</Text>
          <Text style={s.meta}>
            {d.ocasiao} · {d.dataEvento} · {d.convidados} convidados
          </Text>
        </View>

        <View style={s.secao}>
          <Text style={s.paragrafo}>{d.apresentacao}</Text>
        </View>

        {d.escopo ? (
          <View style={s.secao}>
            <Text style={s.h2}>Sobre o seu evento</Text>
            <Text style={s.paragrafo}>{d.escopo}</Text>
          </View>
        ) : null}

        <View style={s.colunas}>
          <View style={s.coluna}>
            <Text style={[s.colTitulo, { color: VINHO }]}>INCLUÍDO</Text>
            {d.incluidos.map((i) => (
              <Text key={i} style={s.item}>
                • {i}
              </Text>
            ))}
          </View>
          <View style={s.coluna}>
            <Text style={[s.colTitulo, { color: SUAVE }]}>NÃO INCLUÍDO</Text>
            {d.excluidos.map((i) => (
              <Text key={i} style={[s.item, { color: SUAVE }]}>
                • {i}
              </Text>
            ))}
          </View>
        </View>

        <View style={s.valorBox}>
          <Text style={s.valorLabel}>Valor total</Text>
          <Text style={s.valor}>{d.valorTotal}</Text>
          {d.condicoes ? (
            <Text style={s.cond}>Condições de pagamento: {d.condicoes}</Text>
          ) : null}
          {d.validade ? (
            <Text style={[s.cond, { color: SUAVE }]}>Proposta válida até {d.validade}.</Text>
          ) : null}
        </View>

        <View style={s.sinalBox}>
          <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 4 }}>
            Sinal de garantia
          </Text>
          <Text style={{ color: SUAVE, lineHeight: 1.4 }}>{d.notaSinal}</Text>
          {d.sinal ? (
            <Text style={{ marginTop: 6 }}>
              Valor de referência do sinal (50%): {d.sinal}.
            </Text>
          ) : null}
        </View>

        {d.ressalvas ? <Text style={s.ressalva}>{d.ressalvas}</Text> : null}

        <Text style={s.rodape} fixed>
          SAL &amp; TAL — O Churrasco · Tradição e técnica que atravessam gerações.
        </Text>
      </Page>
    </Document>
  );
}
