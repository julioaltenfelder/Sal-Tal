// Constantes compartilhadas que precisam ser importadas tanto no servidor
// (Node) quanto no middleware (Edge). Mantê-las aqui evita puxar dependências
// pesadas (ex: bcrypt) para o bundle do middleware.

export const COOKIE_NOME = "saletal_sessao";
