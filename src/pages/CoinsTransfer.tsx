/**
 * src/pages/CoinsTransfer.tsx — Bambeh Marketplace
 *
 * FIXED (this version):
 *  ✅ Full i18n — EN, FR, Pidgin, Arabic, Fulfulde
 *  ✅ RTL layout for Arabic
 *  ✅ Properly credits recipient wallet (not just debits sender)
 *  ✅ Tries transfer_zerm_coins RPC first; clean manual fallback that ALSO credits recipient
 *  ✅ Logs debit for sender + credit for recipient in zerm_transactions
 *  ✅ Route /coins/transfer (matches router fix)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Zap, Send, CheckCircle, Loader2, AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

// ── i18n ──────────────────────────────────────────────────────────────────────
const strings = {
  en: {
    pageTitle:    'Transfer Zerm Coins',
    yourBalance:  'Your Balance',
    recipientLabel: 'Recipient Email *',
    recipientPH:  'friend@email.com',
    recipientHint:'They must have a Bambeh account',
    amountLabel:  'Amount *',
    customPH:     'Or enter custom amount',
    noteLabel:    'Note (optional)',
    notePH:       "What's this for?",
    sendBtn:      (n: string) => `Send ${n || '0'} Coins`,
    sending:      'Sending…',
    disclaimer:   'Transfers are instant and cannot be reversed.',
    errRecipient: 'Please enter recipient email.',
    errMinAmount: 'Minimum transfer is 10 coins.',
    errBalance:   (b: number) => `You only have ${b} coins.`,
    errNotFound:  'No user found with that email. Ask them to register on Bambeh first.',
    errFailed:    'Transfer failed. Please try again.',
    errInsufficient: 'Insufficient coins balance.',
    successTitle: 'Transfer Sent! 🎉',
    successCoins: (n: string, email: string) => `${n} Zerm Coins sent to ${email}`,
    notePrefix:   'Note: ',
    backWallet:   'Back to Wallet',
  },
  fr: {
    pageTitle:    'Transférer des Pièces Zerm',
    yourBalance:  'Votre Solde',
    recipientLabel: 'Email du destinataire *',
    recipientPH:  'ami@email.com',
    recipientHint:'Il doit avoir un compte Bambeh',
    amountLabel:  'Montant *',
    customPH:     'Ou entrez un montant personnalisé',
    noteLabel:    'Note (facultatif)',
    notePH:       'Pour quoi ?',
    sendBtn:      (n: string) => `Envoyer ${n || '0'} pièces`,
    sending:      'Envoi…',
    disclaimer:   'Les transferts sont instantanés et irréversibles.',
    errRecipient: `Veuillez entrer l'email du destinataire.`,
    errMinAmount: 'Le minimum est 10 pièces.',
    errBalance:   (b: number) => `Vous n'avez que ${b} pièces.`,
    errNotFound:  "Aucun utilisateur avec cet email. Demandez-lui de s'inscrire sur Bambeh.",
    errFailed:    'Échec du transfert. Veuillez réessayer.',
    errInsufficient: 'Solde insuffisant.',
    successTitle: 'Transfert envoyé ! 🎉',
    successCoins: (n: string, email: string) => `${n} pièces envoyées à ${email}`,
    notePrefix:   'Note : ',
    backWallet:   'Retour au portefeuille',
  },
  pidgin: {
    pageTitle:    'Send Zerm Coins',
    yourBalance:  'Your Balance',
    recipientLabel: 'Padi Email *',
    recipientPH:  'padi@email.com',
    recipientHint:'Dem must get Bambeh account',
    amountLabel:  'How much *',
    customPH:     'Type your own amount',
    noteLabel:    'Note (if you want)',
    notePH:       'Why you dey send?',
    sendBtn:      (n: string) => `Send ${n || '0'} Coins`,
    sending:      'Dey send…',
    disclaimer:   'Transfer no fit reverse.',
    errRecipient: 'Enter padi email.',
    errMinAmount: 'Minimum na 10 coins.',
    errBalance:   (b: number) => `You only get ${b} coins.`,
    errNotFound:  'No Bambeh user with that email. Make dem register first.',
    errFailed:    'Transfer fail. Try again.',
    errInsufficient: 'Coins no reach.',
    successTitle: 'Transfer Done! 🎉',
    successCoins: (n: string, email: string) => `${n} Zerm Coins reach ${email}`,
    notePrefix:   'Note: ',
    backWallet:   'Go back Wallet',
  },
  ar: {
    pageTitle:    'تحويل عملات زرم',
    yourBalance:  'رصيدك',
    recipientLabel: 'بريد المستلم *',
    recipientPH:  'friend@email.com',
    recipientHint:'يجب أن يكون لديه حساب على Bambeh',
    amountLabel:  'المبلغ *',
    customPH:     'أو أدخل مبلغاً مخصصاً',
    noteLabel:    'ملاحظة (اختياري)',
    notePH:       'لماذا تÙرسل؟',
    sendBtn:      (n: string) => `إرسال ${n || '0'} عملة`,
    sending:      'جارÙ الإرسال…',
    disclaimer:   'التحويلات Ùورية ولا يمكن التراجع عنها.',
    errRecipient: 'أدخل بريد المستلم.',
    errMinAmount: 'الحد الأدنى هو 10 عملات.',
    errBalance:   (b: number) => `لديك Ùقط ${b} عملة.`,
    errNotFound:  'لا يوجد مستخدم بهذا البريد. اطلب منه التسجيل Ùي Bambeh أولاً.',
    errFailed:    'Ùشل التحويل. حاول مجدداً.',
    errInsufficient: 'رصيد غير كاÙÙ.',
    successTitle: 'تم التحويل! 🎉',
    successCoins: (n: string, email: string) => `تم إرسال ${n} عملة إلى ${email}`,
    notePrefix:   'ملاحظة: ',
    backWallet:   'العودة للمحÙظة',
  },
  fulfulde: {
    pageTitle:    'Neldu Zerm Coinɗe',
    yourBalance:  'Soodaande maa',
    recipientLabel: 'Iimeel Heɓante *',
    recipientPH:  'tawto@iimeel.com',
    recipientHint:'Nde waawi heɓde, na waɗi akonto Bambeh',
    amountLabel:  'Yonta *',
    customPH:     'Sifa yonta maa',
    noteLabel:    'Takko (so waɗii)',
    notePH:       'Ndeen woni ko?',
    sendBtn:      (n: string) => `Neldu ${n || '0'} Coinɗe`,
    sending:      'Dawnugol…',
    disclaimer:   'Neldugol ɓeto laawol, waawaa wurtude.',
    errRecipient: 'Sifa iimeel heɓante.',
    errMinAmount: 'Keewu ɓurtii 10 coinɗe.',
    errBalance:   (b: number) => `A heɓii kan ${b} coinɗe.`,
    errNotFound:  'Alaa jannginoowo Bambeh e iimeel oo. Woy nde ari jannginoo.',
    errFailed:    'Neldugol tinaaki. Taaɓ kadi.',
    errInsufficient: 'Coinɗe alaa.',
    successTitle: 'Neldugol woni! 🎉',
    successCoins: (n: string, email: string) => `${n} coinɗe neldaa e ${email}`,
    notePrefix:   'Takko: ',
    backWallet:   'Rutto Jaaborgal',
  },
} as const;

type Lang = keyof typeof strings;

const QUICK_AMOUNTS = [50, 100, 200, 500];

export default function CoinsTransfer() {
  const langRaw = useLang() as string;
  const lang: Lang = (langRaw in strings ? langRaw : 'en') as Lang;
  const s       = strings[lang];
  const isRtl   = lang === 'ar';
  const navigate = useNavigate();

  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount,         setAmount]         = useState('');
  const [note,           setNote]           = useState('');
  const [loading,        setLoading]        = useState(false);
  const [done,           setDone]           = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [myBalance,      setMyBalance]      = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase
        .from('zerm_coins')
        .select('balance')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (data) setMyBalance(data.balance ?? 0);
      else setMyBalance(0);
    })();
  }, []);

  async function handleTransfer() {
    setError(null);
    if (!recipientEmail.trim())                              { setError(s.errRecipient); return; }
    if (!amount || Number(amount) < 10)                     { setError(s.errMinAmount); return; }
    if (myBalance !== null && Number(amount) > myBalance)   { setError(s.errBalance(myBalance)); return; }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }

      const senderId = session.user.id;
      const coins    = Number(amount);
      const noteText = note.trim() || `Transfer to ${recipientEmail}`;

      // 1. Look up recipient by email in profiles
      const { data: recipientProfile } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('email', recipientEmail.trim().toLowerCase())
        .maybeSingle();

      if (!recipientProfile) {
        setError(s.errNotFound);
        setLoading(false);
        return;
      }

      const recipientId = recipientProfile.id;

      // 2. Try atomic RPC first
      let rpcSuccess = false;
      try {
        const { error: rpcErr } = await supabase.rpc('transfer_zerm_coins', {
          p_sender_id:    senderId,
          p_recipient_id: recipientId,
          p_amount:       coins,
          p_note:         noteText,
        });
        if (!rpcErr) rpcSuccess = true;
      } catch (_) { /* RPC not deployed yet — fall through */ }

      if (!rpcSuccess) {
        // Manual fallback — debit sender, credit recipient, log both
        const { data: senderWallet } = await supabase
          .from('zerm_coins')
          .select('balance')
          .eq('user_id', senderId)
          .maybeSingle();

        if (!senderWallet || senderWallet.balance < coins) {
          setError(s.errInsufficient);
          setLoading(false);
          return;
        }

        const { data: recipWallet } = await supabase
          .from('zerm_coins')
          .select('balance')
          .eq('user_id', recipientId)
          .maybeSingle();

        const recipCurrentBalance = recipWallet?.balance ?? 0;

        // Debit sender
        await supabase.from('zerm_coins').upsert(
          { user_id: senderId,    balance: senderWallet.balance - coins, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' },
        );

        // Credit recipient
        await supabase.from('zerm_coins').upsert(
          { user_id: recipientId, balance: recipCurrentBalance + coins, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' },
        );

        // Log debit for sender
        await supabase.from('zerm_transactions').insert({
          user_id:     senderId,
          type:        'debit',
          amount:      coins,
          description: `Transfer to ${recipientEmail}${note.trim() ? ` — ${note.trim()}` : ''}`,
        });

        // Log credit for recipient
        await supabase.from('zerm_transactions').insert({
          user_id:     recipientId,
          type:        'credit',
          amount:      coins,
          description: `Received from ${session.user.email}${note.trim() ? ` — ${note.trim()}` : ''}`,
        });
      }

      setDone(true);
    } catch (e: any) {
      console.error('CoinsTransfer error:', e);
      setError(s.errFailed);
    } finally {
      setLoading(false);
    }
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (done) {
    return (
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="min-h-screen flex items-center justify-center bg-gray-50 p-6"
      >
        <div className="bg-white rounded-2xl shadow-md p-8 text-center max-w-sm w-full">
          <CheckCircle className="w-14 h-14 text-teal-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-3">{s.successTitle}</h2>
          <p className="text-gray-500 text-sm mb-2">
            {s.successCoins(amount, recipientEmail)}
          </p>
          {note && <p className="text-gray-400 text-xs mb-6">{s.notePrefix}{note}</p>}
          <button
            onClick={() => navigate('/coins')}
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold active:scale-95 transition-transform"
          >
            {s.backWallet}
          </button>
        </div>
      </div>
    );
  }

  // ── Main screen ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-12" dir={isRtl ? 'rtl' : 'ltr'}>

      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
        </button>
        <h1 className="font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-teal-600" /> {s.pageTitle}
        </h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* Balance */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-5 text-white text-center">
          <p className="text-teal-100 text-sm mb-1">{s.yourBalance}</p>
          <p className="text-4xl font-bold">
            {myBalance !== null ? myBalance.toLocaleString() : '…'}
          </p>
          <p className="text-teal-100 text-sm">Zerm Coins</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm border space-y-4">

          {/* Recipient */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {s.recipientLabel}
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={e => setRecipientEmail(e.target.value)}
              placeholder={s.recipientPH}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-400"
            />
            <p className="text-xs text-gray-400 mt-1">{s.recipientHint}</p>
          </div>

          {/* Quick amounts */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {s.amountLabel}
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {QUICK_AMOUNTS.map(a => (
                <button
                  key={a}
                  onClick={() => setAmount(String(a))}
                  className={`py-2 rounded-xl text-sm font-semibold border transition ${
                    amount === String(a)
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder={s.customPH}
              min="10"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {s.noteLabel}
            </label>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={s.notePH}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
        </div>

        <button
          onClick={handleTransfer}
          disabled={loading || !recipientEmail || !amount}
          className="w-full bg-teal-600 text-white py-4 rounded-2xl font-bold text-base disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          {loading
            ? <><Loader2 className="w-5 h-5 animate-spin" /> {s.sending}</>
            : <><Send className="w-5 h-5" /> {s.sendBtn(amount)}</>
          }
        </button>

        <p className="text-center text-xs text-gray-400">{s.disclaimer}</p>
      </div>
    </div>
  );
}


