import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Modal } from '../components/Modal';
import { escrowCopy, langLabels, Lang } from '../i18n/escrow';
import { useEscrow } from '../hooks/useEscrow';

export default function EscrowPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { escrow, loading, actionLoading, error, confirmReceipt, raiseDispute } = useEscrow(orderId);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>('en');

  const copy = escrowCopy[lang];
  const statusLabel = useMemo(() => {
    if (!escrow) return '';
    switch (escrow.status) {
      case 'pending':
        return 'Pending';
      case 'funded':
        return 'Funds Held';
      case 'in_transit':
        return 'In Transit';
      case 'delivered':
        return 'Delivered';
      case 'completed':
        return 'Completed';
      case 'disputed':
        return 'Disputed';
      case 'refunded':
        return 'Refunded';
      default:
        return '';
    }
  }, [escrow]);

  async function onConfirm() {
    try {
      const res = await confirmReceipt();
      setMessage(res?.message ?? copy.successConfirm);
      setConfirmOpen(false);
    } catch {
    }
  }

  async function onDispute() {
    if (!disputeReason.trim()) return;
    try {
      const res = await raiseDispute(disputeReason.trim());
      setMessage(res?.message ?? copy.successDispute);
      setDisputeReason('');
      setDisputeOpen(false);
    } catch {
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-6 text-gray-700">{copy.loading}</div>;
  }

  if (error || !escrow) {
    return <div className="min-h-screen bg-gray-50 p-6 text-red-700">{error ?? copy.errorFallback}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 px-4 py-8" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <div className="flex items-center justify-between gap-3">
            <Link to="/orders" className="text-sm font-medium text-teal-700 hover:text-teal-900">
              {copy.backToOrders}
            </Link>

            <select
              value={lang}
              onChange={e => setLang(e.target.value as Lang)}
              className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
              aria-label="Language"
            >
              {Object.entries(langLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{copy.title}</h1>
              <p className="mt-1 text-sm text-gray-600">Order #{escrow.orderId}</p>
            </div>
            <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-semibold text-gray-800">
              {statusLabel}
            </span>
          </div>
        </header>

        {message && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800" aria-live="polite">
            {message}
          </div>
        )}

        <section className="mb-6 rounded-2xl bg-gradient-to-r from-teal-600 to-blue-600 p-5 text-white shadow-lg">
          <h2 className="text-lg font-bold">{copy.yourMoneySafeTitle}</h2>
          <p className="mt-1 text-sm text-teal-100">{copy.yourMoneySafeBody}</p>
        </section>

        <section className="mb-6 rounded-2xl bg-white p-5 shadow-md">
          <div className="flex gap-4 items-center">
            <img src={escrow.itemImage} alt={escrow.itemName} className="h-20 w-20 rounded-xl object-cover" />
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">{escrow.itemName}</h2>
              <p className="mt-1 text-sm text-gray-600">
                Sold by <span className="font-semibold text-teal-700">{escrow.sellerName}</span>
              </p>
              <p className="mt-1 text-sm text-gray-700">Trust score: {escrow.sellerTrustScore.toFixed(1)}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-teal-700">{escrow.amountZerm.toLocaleString()} Zerm</div>
              <div className="text-xs text-gray-500">{escrow.amountXAF.toLocaleString()} XAF</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 text-sm">
            <div>
              <span className="text-gray-400">Escrow ID</span>
              <p className="font-mono text-xs font-semibold text-gray-700">{escrow.id}</p>
            </div>
            <div>
              <span className="text-gray-400">Deadline</span>
              <p className="font-semibold text-gray-700">{escrow.deadlineDate}</p>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-2xl bg-white p-5 shadow-md">
          <h3 className="mb-4 text-lg font-bold text-gray-900">{copy.transactionProgress}</h3>
          <ol className="space-y-4">
            {escrow.steps.map((step, index) => (
              <li key={step.id} className="flex items-start gap-3">
                <div
                  className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    step.completed ? 'bg-teal-600 text-white' : step.active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step.completed ? '✓' : step.id}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${step.completed || step.active ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                  <p className="text-sm text-gray-500">{step.sublabel}</p>
                  {step.date && <p className="text-xs font-medium text-teal-700">{step.date}</p>}
                  {index < escrow.steps.length - 1 && <div className="mt-4 h-px bg-gray-100" />}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-6 rounded-2xl bg-white p-5 shadow-md">
          <h3 className="mb-3 text-lg font-bold text-gray-900">{copy.yourActions}</h3>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={!escrow.canConfirmReceipt || actionLoading}
              className="w-full rounded-xl bg-teal-600 py-3.5 font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copy.confirmButton}
            </button>
            <button
              type="button"
              onClick={() => setDisputeOpen(true)}
              disabled={!escrow.canRaiseDispute || actionLoading}
              className="w-full rounded-xl border border-red-200 bg-red-50 py-3 font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copy.disputeButton}
            </button>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-md">
          <h3 className="mb-4 text-lg font-bold text-gray-900">{copy.protectionsTitle}</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li><span className="font-semibold text-gray-900">{copy.protection1Title}:</span> {copy.protection1Body}</li>
            <li><span className="font-semibold text-gray-900">{copy.protection2Title}:</span> {copy.protection2Body}</li>
            <li><span className="font-semibold text-gray-900">{copy.protection3Title}:</span> {copy.protection3Body}</li>
            <li><span className="font-semibold text-gray-900">{copy.protection4Title}:</span> {copy.protection4Body}</li>
          </ul>
        </section>
      </div>

      <Modal
        open={confirmOpen}
        title={copy.confirmModalTitle}
        description={copy.confirmModalBody}
        onClose={() => setConfirmOpen(false)}
      >
        <p className="text-sm text-gray-700">
          You are releasing {escrow.amountZerm.toLocaleString()} Zerm ({escrow.amountXAF.toLocaleString()} XAF) to{' '}
          {escrow.sellerName}.
        </p>
        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={actionLoading}
            className="w-full rounded-xl bg-teal-600 py-3 font-bold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {actionLoading ? 'Processing...' : copy.confirmModalPrimary}
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(false)}
            className="w-full rounded-xl bg-gray-100 py-3 font-medium text-gray-700 hover:bg-gray-200"
          >
            {copy.cancel}
          </button>
        </div>
      </Modal>

      <Modal
        open={disputeOpen}
        title={copy.disputeModalTitle}
        description={copy.disputeModalBody}
        onClose={() => setDisputeOpen(false)}
      >
        <label htmlFor="disputeReason" className="mb-2 block text-sm font-medium text-gray-700">
          {copy.disputeReasonLabel}
        </label>
        <textarea
          id="disputeReason"
          value={disputeReason}
          onChange={e => setDisputeReason(e.target.value)}
          className="min-h-32 w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200"
          placeholder={copy.disputePlaceholder}
        />
        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={onDispute}
            disabled={actionLoading || !disputeReason.trim()}
            className="w-full rounded-xl bg-red-600 py-3 font-bold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {actionLoading ? 'Submitting...' : copy.submitDispute}
          </button>
          <button
            type="button"
            onClick={() => setDisputeOpen(false)}
            className="w-full rounded-xl bg-gray-100 py-3 font-medium text-gray-700 hover:bg-gray-200"
          >
            {copy.cancel}
          </button>
        </div>
      </Modal>
    </div>
  );
}
