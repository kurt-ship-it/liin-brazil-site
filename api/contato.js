// POST /api/contato — recebe a solicitação de avaliação de filiação
// Variáveis de ambiente na Vercel: RESEND_API_KEY, CONTATO_DESTINO

const LIMITE = new Map(); // rate limit simples por IP, em memória

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  // rate limit: 5 envios por IP a cada 10 minutos
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'sem-ip';
  const agora = Date.now();
  const janela = LIMITE.get(ip)?.filter(t => agora - t < 600_000) ?? [];
  if (janela.length >= 5) return res.status(429).json({ erro: 'Muitas solicitações. Tente novamente em alguns minutos.' });
  LIMITE.set(ip, [...janela, agora]);

  const b = req.body ?? {};

  // honeypot — bots preenchem campos ocultos
  if (b.website) return res.status(200).json({ ok: true });

  const obrigatorios = ['instituicao', 'tipo', 'nome', 'email'];
  const faltando = obrigatorios.filter(c => !String(b[c] ?? '').trim());
  if (faltando.length) return res.status(400).json({ erro: `Campos obrigatórios: ${faltando.join(', ')}` });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b.email)) return res.status(400).json({ erro: 'E-mail inválido' });
  if (b.consentimento !== true) return res.status(400).json({ erro: 'Consentimento LGPD obrigatório' });

  const esc = s => String(s ?? '').slice(0, 2000)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const temas = Array.isArray(b.temas) ? b.temas.map(esc).join(' · ') : '—';

  const html = `
    <h2 style="font-family:system-ui;margin:0 0 18px">Solicitação de avaliação de filiação</h2>
    <table style="font-family:system-ui;font-size:14px;border-collapse:collapse">
      <tr><td style="padding:6px 18px 6px 0;color:#6B7280">Instituição</td><td><b>${esc(b.instituicao)}</b></td></tr>
      <tr><td style="padding:6px 18px 6px 0;color:#6B7280">Tipo</td><td>${esc(b.tipo)}</td></tr>
      <tr><td style="padding:6px 18px 6px 0;color:#6B7280">Nome</td><td>${esc(b.nome)}</td></tr>
      <tr><td style="padding:6px 18px 6px 0;color:#6B7280">Cargo</td><td>${esc(b.cargo) || '—'}</td></tr>
      <tr><td style="padding:6px 18px 6px 0;color:#6B7280">E-mail</td><td>${esc(b.email)}</td></tr>
      <tr><td style="padding:6px 18px 6px 0;color:#6B7280">Telefone</td><td>${esc(b.telefone) || '—'}</td></tr>
      <tr><td style="padding:6px 18px 6px 0;color:#6B7280">Temas</td><td>${temas}</td></tr>
      <tr><td style="padding:6px 18px 6px 0;color:#6B7280;vertical-align:top">Contexto</td><td>${esc(b.contexto) || '—'}</td></tr>
    </table>
    <p style="font-family:system-ui;font-size:12px;color:#9CA3AF;margin-top:22px">
      Recebido em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} · liinbrazil.org
    </p>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'LIIN Brazil <site@liinbrazil.org>',
        to: [process.env.CONTATO_DESTINO || 'kurt@liinbrazil.org'],
        reply_to: b.email,
        subject: `Filiação — ${b.instituicao} (${b.tipo})`,
        html,
      }),
    });
    if (!r.ok) throw new Error(await r.text());
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Falha no envio:', e);
    return res.status(502).json({ erro: 'Não foi possível enviar agora. Escreva para kurt@liinbrazil.org.' });
  }
}
