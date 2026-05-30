/**
 * BAMBEH — Create Missing Files Script
 * Run from your project root: node create-missing-files.js
 */

const fs   = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');

function write(filePath, content) {
  const full = path.join(SRC, filePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trimStart(), 'utf8');
  console.log('[OK]', filePath);
}

// ─── 1. NotFoundPage ─────────────────────────────────────────────────────────
write('pages/NotFoundPage.tsx', `
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="text-center bg-white rounded-2xl shadow-2xl p-12 max-w-md">
        <div className="text-8xl font-bold text-teal-600 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          Sorry, we could not find the page you are looking for. It may have been moved or deleted.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-all"
          >
            Go Back
          </button>
          <Link
            to="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg hover:from-teal-700 hover:to-blue-700 font-bold shadow-lg transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
`);

// ─── 2. TermsOfService ───────────────────────────────────────────────────────
write('pages/TermsOfService.tsx', `
import React from 'react';
import { Link } from 'react-router-dom';

const sections = [
  { title: '1. Acceptance of Terms', body: 'By accessing or using Bambeh Marketplace you agree to be bound by these Terms of Service and all applicable laws of the Republic of . If you do not agree, you may not use our services.' },
  { title: '2. Marketplace Services', body: 'Bambeh provides an online marketplace for buying, selling, job listings, property rentals, and financial tools including Zerm Coins and Tontine savings. Bambeh acts as an intermediary and is not a party to transactions between buyers and sellers.' },
  { title: '3. User Accounts', body: 'You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your credentials. We reserve the right to suspend or terminate accounts that violate these terms.' },
  { title: '4. Vendor Obligations', body: 'Vendors must accurately describe their products and services. Counterfeit goods, illegal items, or prohibited content is strictly forbidden. Bambeh escrow protects buyers — vendors receive payment only after buyer confirmation.' },
  { title: '5. Payments & Zerm Coins', body: 'All payments are in XAF (Central African Franc) via NotchPay (MTN Mobile Money and Orange Money). Zerm Coins are a digital loyalty currency with no cash redemption value unless explicitly stated. Balances are managed server-side.' },
  { title: '6. Prohibited Content', body: 'You may not post or sell: weapons, drugs, counterfeit goods, stolen property, explicit content, or any items prohibited under ian law. Violations result in immediate account termination.' },
  { title: '7. Limitation of Liability', body: 'Bambeh is not liable for losses from user transactions, unauthorized account access due to user negligence, downtime, or third-party actions.' },
  { title: '8. Governing Law', body: 'These terms are governed by the laws of the Republic of , with jurisdiction in Yaounde.' },
  { title: '9. Changes to Terms', body: 'We may update these Terms at any time. Continued use of Bambeh after changes are posted constitutes acceptance. We will notify you of material changes via email or in-app notification.' },
];

const TermsOfService: React.FC = () => (
  <div className="max-w-3xl mx-auto py-10 px-4">
    <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
    <p className="text-sm text-gray-400 mb-8">Last updated: January 2026</p>
    <div className="space-y-8">
      {sections.map(s => (
        <div key={s.title}>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">{s.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
        </div>
      ))}
    </div>
    <div className="mt-10 pt-6 border-t border-gray-100">
      <Link to="/privacy-policy" className="text-sm text-teal-600 hover:underline">Privacy Policy &rarr;</Link>
    </div>
  </div>
);

export default TermsOfService;
`);

// ─── 3. CoinsHistory ─────────────────────────────────────────────────────────
write('pages/CoinsHistory.tsx', `
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Tx { id: string; type: string; amount: number; description: string; date: string; }

const CoinsHistory: React.FC = () => {
  const [txs, setTxs]       = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setTxs([
        { id: '1', type: 'earn',     amount:  50,  description: 'First purchase bonus',       date: '2026-02-28' },
        { id: '2', type: 'spend',    amount: -30,  description: 'Boost listing',              date: '2026-02-27' },
        { id: '3', type: 'purchase', amount:  500, description: 'Purchased 500 Zerm Coins',  date: '2026-02-20' },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  const earned = txs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const spent  = Math.abs(txs.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/coins" className="text-teal-600 hover:underline text-sm">&larr; Wallet</Link>
        <h1 className="text-xl font-bold text-gray-900">Transaction History</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
          <p className="text-xs text-green-600 font-medium">Total Earned</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{earned} ZC</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
          <p className="text-xs text-red-600 font-medium">Total Spent</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{spent} ZC</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {txs.map(tx => (
            <div key={tx.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{tx.description}</p>
                <p className="text-xs text-gray-400">{tx.date}</p>
              </div>
              <p className={tx.amount > 0 ? 'text-sm font-bold text-green-600' : 'text-sm font-bold text-red-600'}>
                {tx.amount > 0 ? '+' : ''}{tx.amount} ZC
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-center">
        <Link to="/coins/transfer" className="text-sm text-teal-600 font-medium hover:underline">
          Transfer Zerm Coins &rarr;
        </Link>
      </div>
    </div>
  );
};

export default CoinsHistory;
`);

// ─── 4. CoinsTransfer ────────────────────────────────────────────────────────
write('pages/CoinsTransfer.tsx', `
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CoinsTransfer: React.FC = () => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount]       = useState('');
  const [done, setDone]           = useState(false);
  const [loading, setLoading]     = useState(false);
  const myBalance = 250;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setDone(true);
  };

  if (done) return (
    <div className="max-w-md mx-auto py-12 px-4 text-center">
      <div className="text-6xl mb-4">&#10003;</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Transfer Successful!</h1>
      <p className="text-gray-500 text-sm mb-8">
        You sent <strong>{amount}</strong> Zerm Coins to <strong>{recipient}</strong>.
      </p>
      <Link to="/coins" className="px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold text-sm">
        Back to Wallet
      </Link>
    </div>
  );

  return (
    <div className="max-w-md mx-auto py-6 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/coins" className="text-teal-600 text-sm hover:underline">&larr; Wallet</Link>
        <h1 className="text-xl font-bold text-gray-900">Transfer Coins</h1>
      </div>

      <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-teal-600">Your Balance</p>
          <p className="text-2xl font-bold text-teal-700">{myBalance} ZC</p>
        </div>
        <span className="text-3xl">&#129683;</span>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
          <input
            type="text" value={recipient} onChange={e => setRecipient(e.target.value)}
            required placeholder="@username or phone number"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Zerm Coins)</label>
          <input
            type="number" value={amount} onChange={e => setAmount(e.target.value)}
            required min={1} max={myBalance} placeholder="e.g. 50"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>
        <button
          type="submit" disabled={loading}
          className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700 disabled:opacity-60 transition-colors"
        >
          {loading ? 'Sending...' : 'Send Coins'}
        </button>
      </form>
    </div>
  );
};

export default CoinsTransfer;
`);

// ─── 5. TontineDetail ────────────────────────────────────────────────────────
write('pages/TontineDetail.tsx', `
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const TontineDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<'overview' | 'members' | 'schedule'>('overview');

  const tontine = {
    name: 'Savings Group', contribution: 10000, frequency: 'Monthly',
    members: 5, maxMembers: 10, nextPayout: '2026-03-15',
    currentRound: 2, totalRounds: 10, totalPool: 50000, status: 'active',
  };

  return (
    <div className="max-w-lg mx-auto py-6 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/tontine" className="text-teal-600 text-sm hover:underline">&larr; Tontine</Link>
        <h1 className="text-xl font-bold text-gray-900">{tontine.name}</h1>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Pool',    value: tontine.totalPool.toLocaleString() + ' XAF' },
          { label: 'Round',   value: tontine.currentRound + '/' + tontine.totalRounds },
          { label: 'Members', value: tontine.members + '/' + tontine.maxMembers },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className="text-sm font-bold text-teal-700 mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-4">
        {(['overview', 'members', 'schedule'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={'flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-colors ' + (tab === t ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500')}>
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        {tab === 'overview' && (
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between pt-2 border-t border-gray-50">
              <span className="text-gray-400">Contribution</span>
              <span className="font-medium">{tontine.contribution.toLocaleString()} XAF / {tontine.frequency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Next Payout</span>
              <span className="font-medium text-teal-600">{tontine.nextPayout}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium capitalize">{tontine.status}</span>
            </div>
            <button className="w-full mt-4 py-3 bg-teal-600 text-white rounded-xl font-semibold text-sm">
              Pay Contribution
            </button>
          </div>
        )}
        {tab === 'members' && (
          <div className="space-y-3">
            {Array.from({ length: tontine.members }, (_, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-sm font-bold text-teal-700">
                  {String.fromCharCode(65 + i)}
                </div>
                <p className="text-sm font-medium text-gray-800">Member {i + 1}</p>
                {i === 1 && <span className="ml-auto text-xs px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full">Next</span>}
              </div>
            ))}
          </div>
        )}
        {tab === 'schedule' && (
          <div className="space-y-2">
            {Array.from({ length: tontine.totalRounds }, (_, i) => (
              <div key={i} className={'flex justify-between py-2 px-3 rounded-lg text-sm ' +
                (i < tontine.currentRound - 1 ? 'bg-green-50 text-green-700' :
                 i === tontine.currentRound - 1 ? 'bg-teal-50 text-teal-700 font-semibold' : 'bg-gray-50 text-gray-500')}>
                <span>Round {i + 1}</span>
                <span>{i < tontine.currentRound - 1 ? 'Paid' : i === tontine.currentRound - 1 ? 'Active' : 'Pending'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TontineDetail;
`);

// ─── 6. TontineCreate ────────────────────────────────────────────────────────
write('pages/TontineCreate.tsx', `
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const TontineCreate: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName]               = useState('');
  const [contribution, setContribution] = useState('');
  const [frequency, setFrequency]     = useState('monthly');
  const [maxMembers, setMaxMembers]   = useState('5');
  const [startDate, setStartDate]     = useState('');
  const [saving, setSaving]           = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    navigate('/tontine');
  };

  return (
    <div className="max-w-lg mx-auto py-6 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/tontine" className="text-teal-600 text-sm hover:underline">&larr; Tontine</Link>
        <h1 className="text-xl font-bold text-gray-900">Create Tontine Group</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
          <input value={name} onChange={e => setName(e.target.value)} required
            placeholder="e.g. Biyem-Assi Savings Club"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contribution (XAF)</label>
            <input type="number" min="500" value={contribution} onChange={e => setContribution(e.target.value)} required
              placeholder="5000"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
            <select value={frequency} onChange={e => setFrequency(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none">
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Members</label>
            <input type="number" min="2" max="50" value={maxMembers} onChange={e => setMaxMembers(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-800">
          Escrow Protected: Contributions are held securely until each payout round is complete.
        </div>

        <button type="submit" disabled={saving}
          className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700 disabled:opacity-60 transition-colors">
          {saving ? 'Creating...' : 'Create Tontine Group'}
        </button>
      </form>
    </div>
  );
};

export default TontineCreate;
`);

// ─── 7. EditMarketplaceListing ───────────────────────────────────────────────
write('pages/EditMarketplaceListing.tsx', `
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const EditMarketplaceListing: React.FC = () => {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const [title, setTitle]   = useState('');
  const [price, setPrice]   = useState('');
  const [desc, setDesc]     = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    // Replace with: const { data } = await supabase.from('listings').select('*').eq('id', id).single();
    setTimeout(() => { setTitle('Listing title'); setPrice('25000'); setDesc('Description.'); setLoading(false); }, 500);
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    navigate('/marketplace');
  };

  if (loading) return (
    <div className="max-w-lg mx-auto py-10 px-4 space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="max-w-lg mx-auto py-6 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/marketplace" className="text-teal-600 text-sm hover:underline">&larr; Marketplace</Link>
        <h1 className="text-xl font-bold text-gray-900">Edit Listing</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (XAF)</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} min="0"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none" />
        </div>
        <div className="flex gap-3">
          <Link to="/marketplace" className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm text-center hover:bg-gray-200">
            Cancel
          </Link>
          <button type="submit" disabled={saving}
            className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700 disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMarketplaceListing;
`);

// ─── 8. EditJobListing ───────────────────────────────────────────────────────
write('pages/EditJobListing.tsx', `
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const EditJobListing: React.FC = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [desc, setDesc]   = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    setTimeout(() => { setTitle('Job title'); setDesc('Job description.'); setLoading(false); }, 500);
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    navigate('/jobs');
  };

  if (loading) return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
    </div>
  );

  return (
    <div className="max-w-lg mx-auto py-6 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/jobs" className="text-teal-600 text-sm hover:underline">&larr; Jobs</Link>
        <h1 className="text-xl font-bold text-gray-900">Edit Job Listing</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none" />
        </div>
        <div className="flex gap-3">
          <Link to="/jobs" className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm text-center">Cancel</Link>
          <button type="submit" disabled={saving}
            className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-semibold text-sm disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJobListing;
`);

// ─── 9. EditServiceListing ───────────────────────────────────────────────────
write('pages/EditServiceListing.tsx', `
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const EditServiceListing: React.FC = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    setTimeout(() => { setTitle('Service title'); setPrice('10000'); setLoading(false); }, 500);
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    navigate('/services');
  };

  if (loading) return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
    </div>
  );

  return (
    <div className="max-w-lg mx-auto py-6 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/services" className="text-teal-600 text-sm hover:underline">&larr; Services</Link>
        <h1 className="text-xl font-bold text-gray-900">Edit Service</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (XAF)</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} min="0"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
        </div>
        <div className="flex gap-3">
          <Link to="/services" className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm text-center">Cancel</Link>
          <button type="submit" disabled={saving}
            className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-semibold text-sm disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditServiceListing;
`);

// ─── 10. MarketplaceDrafts ───────────────────────────────────────────────────
write('pages/MarketplaceDrafts.tsx', `
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface Draft { id: string; title: string; category: string; savedAt: string; price?: number; }

const MarketplaceDrafts: React.FC = () => {
  const navigate = useNavigate();
  const [drafts, setDrafts]   = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setDrafts([
        { id: 'd1', title: 'Used iPhone 12', category: 'Electronics', savedAt: '2026-02-28', price: 120000 },
        { id: 'd2', title: 'Handmade bag',   category: 'Fashion',     savedAt: '2026-02-25' },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  return (
    <div className="max-w-lg mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">My Drafts</h1>
        <Link to="/marketplace/sell" className="text-sm px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
          + New Listing
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : drafts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500 text-sm">No drafts saved</p>
          <Link to="/marketplace/sell" className="mt-3 inline-block text-sm text-teal-600 hover:underline">
            Create a listing
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map(draft => (
            <div key={draft.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate">{draft.title}</p>
                <p className="text-xs text-gray-400">{draft.category} &middot; {draft.savedAt}</p>
                {draft.price && (
                  <p className="text-sm font-bold text-teal-600 mt-1">{draft.price.toLocaleString()} XAF</p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => navigate('/marketplace/edit/' + draft.id)}
                  className="text-xs px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100">
                  Edit
                </button>
                <button onClick={() => setDrafts(d => d.filter(x => x.id !== draft.id))}
                  className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketplaceDrafts;
`);

// ─── 11. MarketplaceCategory ─────────────────────────────────────────────────
write('pages/MarketplaceCategory.tsx', `
import React from 'react';
import { useParams, Link } from 'react-router-dom';

const MarketplaceCategory: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const label = category ? decodeURIComponent(category).replace(/-/g, ' ') : 'All';

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-400">
        <Link to="/marketplace" className="hover:text-teal-600">Marketplace</Link>
        <span>&rsaquo;</span>
        <span className="text-gray-700 font-medium capitalize">{label}</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6 capitalize">{label}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="w-full h-40 bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center text-4xl">
              &#128717;
            </div>
            <div className="p-3">
              <p className="font-medium text-gray-800 text-sm">Sample item {i + 1}</p>
              <p className="text-xs text-gray-400 capitalize">{label}</p>
              <p className="text-sm font-bold text-teal-600 mt-1">15,000 XAF</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketplaceCategory;
`);

// ─── 12. JobsCategory ────────────────────────────────────────────────────────
write('pages/JobsCategory.tsx', `
import React from 'react';
import { useParams, Link } from 'react-router-dom';

const JobsCategory: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const label = category ? decodeURIComponent(category).replace(/-/g, ' ') : 'All';

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-400">
        <Link to="/jobs" className="hover:text-teal-600">Jobs</Link>
        <span>&rsaquo;</span>
        <span className="text-gray-700 font-medium capitalize">{label}</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6 capitalize">{label} Jobs</h1>
      <div className="space-y-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-2xl shrink-0">
                &#127970;
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">Sample {label} Job {i + 1}</p>
                <p className="text-xs text-gray-400 mt-0.5">Yaounde,  &middot; Full-time</p>
                <p className="text-sm text-teal-600 font-medium mt-2">200,000 XAF/month</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobsCategory;
`);

// ─── 13. UserSettings ────────────────────────────────────────────────────────
write('pages/settings/UserSettings.tsx', `
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

type Tab = 'general' | 'notifications' | 'privacy' | 'security';

const UserSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('general');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'general',       label: 'General' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'privacy',       label: 'Privacy' },
    { id: 'security',      label: 'Security' },
  ];

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={'flex-1 py-2 rounded-lg text-xs font-medium transition-colors ' +
              (activeTab === tab.id ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Language &amp; Region</h3>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm">
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
              <option value="ha">Hausa</option>
            </select>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Account</h3>
            <Link to="/profile" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-sm text-gray-700">Edit Profile</span><span className="text-gray-400">&rsaquo;</span>
            </Link>
            <Link to="/vendor/home" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-sm text-gray-700">Become a Vendor</span><span className="text-gray-400">&rsaquo;</span>
            </Link>
            <Link to="/subscription" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-sm text-gray-700">Subscription Plans</span><span className="text-gray-400">&rsaquo;</span>
            </Link>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="font-semibold text-gray-800 mb-2">Notification Preferences</h3>
          {['Order Updates', 'New Messages', 'Promotions', 'Price Alerts', 'System Alerts'].map(label => (
            <label key={label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 cursor-pointer">
              <span className="text-sm text-gray-700">{label}</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-teal-600" />
            </label>
          ))}
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Privacy Controls</h3>
            {['Show my profile to other users', 'Allow others to see my listings', 'Show my online status'].map(label => (
              <label key={label} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-teal-600" />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
            <div className="mt-4 space-y-2">
              <Link to="/privacy-policy"   className="block text-sm text-teal-600 hover:underline py-1">Privacy Policy &rarr;</Link>
              <Link to="/terms-of-service" className="block text-sm text-teal-600 hover:underline py-1">Terms of Service &rarr;</Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Security</h3>
            <Link to="/forgot-password" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-700">Change Password</p>
                <p className="text-xs text-gray-400">Update your account password</p>
              </div>
              <span className="text-gray-400">&rsaquo;</span>
            </Link>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-100 p-6">
            <h3 className="font-semibold text-red-700 mb-2">Danger Zone</h3>
            <p className="text-xs text-red-500 mb-4">These actions cannot be undone.</p>
            <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
              Deactivate Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSettings;
`);

// ─── 14. PaymentPending ──────────────────────────────────────────────────────
write('pages/payment/PaymentPending.tsx', `
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const PaymentPending: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [seconds, setSeconds] = useState(0);
  const reference = searchParams.get('reference') ?? 'N/A';

  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const dots = '.'.repeat((seconds % 3) + 1);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 px-4 py-12">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-6 animate-pulse">&#8987;</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Pending{dots}</h1>
        <p className="text-gray-500 text-sm mb-6">
          Your payment via MTN Mobile Money / Orange Money is being processed.
          <strong> Do not close this page.</strong>
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-left">
          <p className="text-xs text-yellow-700 font-semibold mb-1">Reference</p>
          <p className="text-sm font-mono text-yellow-900">{reference}</p>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Elapsed: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
        </p>
        <div className="space-y-2 text-xs text-gray-400">
          <p>&#128241; Check your phone for a pending USSD or push notification</p>
          <p>&#128161; Make sure you have sufficient balance</p>
          <p>&#128260; If nothing happens in 10 minutes, the payment will be cancelled</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPending;
`);

// ─── 15. VendorPublicProfile ─────────────────────────────────────────────────
write('pages/vendor/VendorPublicProfile.tsx', `
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const VendorPublicProfile: React.FC = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 600);
  }, [vendorId]);

  if (loading) return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-4">
      <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
      <div className="h-8 bg-gray-100 rounded-xl animate-pulse w-1/2" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-2xl font-bold text-white shrink-0">
            V
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">Vendor Store</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full text-xs font-semibold border border-teal-200">
                &#10003; Verified
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-0.5">ID: {vendorId}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span><strong className="text-gray-700">4.7</strong> rating</span>
              <span><strong className="text-gray-700">128</strong> reviews</span>
              <span><strong className="text-gray-700">342</strong> transactions</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-4 leading-relaxed">
          Quality products at the best prices. This profile will load from Supabase once connected.
        </p>
        <div className="flex gap-3 mt-4">
          <Link to={'/chat?vendor=' + vendorId}
            className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold text-center hover:bg-teal-700 transition-colors">
            &#128172; Message
          </Link>
          <Link to={'/seller/' + vendorId + '/rating'}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold text-center hover:bg-gray-200 transition-colors">
            &#11088; Leave Review
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="w-full h-32 bg-gradient-to-br from-gray-50 to-teal-50 flex items-center justify-center text-3xl">
              &#128230;
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-800">Item {i + 1}</p>
              <p className="text-sm font-bold text-teal-600 mt-1">25,000 XAF</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorPublicProfile;
`);

// ─── 16. AdminLayout ─────────────────────────────────────────────────────────
write('components/layout/AdminLayout.tsx', `
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/admin/dashboard',       label: 'Dashboard' },
  { path: '/admin/users',           label: 'All Users' },
  { path: '/admin/user-management', label: 'User Accounts' },
  { path: '/admin/disputes',        label: 'Disputes' },
  { path: '/admin/resolve-dispute', label: 'Resolve Dispute' },
  { path: '/admin/live-chat',       label: 'Live Chat' },
  { path: '/admin/inbox',           label: 'Inbox' },
  { path: '/admin/settings',        label: 'Settings' },
  { path: '/admin/create',          label: 'Create Admin' },
];

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('Bambeh_admin');
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className={'fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transition-transform duration-300 md:relative md:translate-x-0 flex flex-col ' + (sidebarOpen ? 'translate-x-0' : '-translate-x-full')}>
        <div className="px-6 py-5 border-b border-gray-700">
          <h1 className="text-xl font-bold text-teal-400">Bambeh Admin</h1>
          <p className="text-xs text-gray-400 mt-1">Control Center</p>
        </div>
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          {navItems.map(item => (
            <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
              className={'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ' +
                (location.pathname === item.path ? 'bg-teal-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white')}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-gray-700">
          <button onClick={handleLogout}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-900/30 transition-colors">
            &#128682; Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100" aria-label="Toggle sidebar">
              &#9776;
            </button>
            <h2 className="text-lg font-semibold text-gray-800">
              {navItems.find(n => n.path === location.pathname)?.label ?? 'Admin'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" target="_blank" rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full font-medium hover:bg-teal-100">
              Main App &#8599;
            </Link>
            <Link to="/vendor/dashboard" target="_blank" rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full font-medium hover:bg-purple-100">
              Vendor Panel &#8599;
            </Link>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
`);

// ─── 17. OfflineModePage ─────────────────────────────────────────────────────
write('pages/OfflineModePage.tsx', `
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface CachedListing { id: string; title: string; price: number; category: string; cachedAt: number; }

const CACHE_KEY = 'Bambeh_offline_listings';
const SYNCED_KEY = 'Bambeh_offline_lastSynced';

function loadCache() {
  try {
    return {
      listings:   JSON.parse(localStorage.getItem(CACHE_KEY)  || '[]') as CachedListing[],
      lastSynced: Number(localStorage.getItem(SYNCED_KEY)) || null,
    };
  } catch { return { listings: [], lastSynced: null }; }
}

function timeAgo(ts: number): string {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return m + ' min ago';
  return Math.floor(m / 60) + ' hr ago';
}

const OfflineModePage: React.FC = () => {
  const [cache, setCache]     = useState(loadCache);
  const [isOnline, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on  = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(SYNCED_KEY);
    setCache({ listings: [], lastSynced: null });
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className={'flex items-center gap-3 p-4 rounded-xl mb-6 ' + (isOnline ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200')}>
        <span className="text-2xl">{isOnline ? '&#128994;' : '&#128246;'}</span>
        <div className="flex-1">
          <p className={'font-semibold text-sm ' + (isOnline ? 'text-green-800' : 'text-orange-800')}>
            {isOnline ? 'You are back online!' : 'You are offline'}
          </p>
          <p className={'text-xs opacity-80 ' + (isOnline ? 'text-green-700' : 'text-orange-700')}>
            {isOnline ? 'All features available.' : 'Showing cached data only.'}
          </p>
        </div>
        {isOnline && (
          <Link to="/" className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-full font-medium">
            Go Home
          </Link>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Offline Mode</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {cache.lastSynced ? 'Last synced: ' + timeAgo(cache.lastSynced) : 'No cached data yet'}
          </p>
        </div>
        {isOnline && cache.listings.length > 0 && (
          <button onClick={clearCache} className="text-xs px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50">
            Clear Cache
          </button>
        )}
      </div>

      {cache.listings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
          <p className="text-4xl mb-3">&#128230;</p>
          <p className="font-medium text-gray-600 text-sm">No cached listings</p>
          <p className="text-xs text-gray-400 mt-1">Browse the marketplace online to cache listings here</p>
          {isOnline && (
            <Link to="/marketplace" className="mt-4 inline-block text-sm text-teal-600 font-medium hover:underline">
              Go to Marketplace &rarr;
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {cache.listings.map((listing: CachedListing) => (
            <div key={listing.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate">{listing.title}</p>
                <p className="text-xs text-gray-400">{listing.category}</p>
                <p className="text-sm font-bold text-teal-600 mt-1">{listing.price.toLocaleString()} XAF</p>
              </div>
              <p className="text-xs text-gray-300 shrink-0">{timeAgo(listing.cachedAt)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <h3 className="font-semibold text-blue-800 text-sm mb-2">How Offline Mode Works</h3>
        <p className="text-xs text-blue-700 leading-relaxed">
          Browse Bambeh while online to cache listings automatically. When you lose internet, visit this page to see your saved data.
          Posting, paying, and sending messages require an internet connection.
        </p>
      </div>
    </div>
  );
};

export default OfflineModePage;
`);

console.log('\n============================================================');
console.log(' ALL 17 FILES CREATED SUCCESSFULLY!');
console.log(' Now run:  npm run dev');
console.log('============================================================\n');

