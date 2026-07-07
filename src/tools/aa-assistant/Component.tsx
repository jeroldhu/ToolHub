import { Calculator, ChevronDown, ChevronRight, Download, Plus, RotateCcw, Save, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type SplitMode = 'total' | 'shipping' | 'shippingRatio';

interface Participant {
  id: string;
  name: string;
}

interface Payment {
  id: string;
  itemName: string;
  itemAmount: string;
  shipping: string;
  coupon: string;
  payerId: string;
  participantIds: string[];
  mode: SplitMode;
  itemPrices: Record<string, string>;
  saved: boolean;
  collapsed: boolean;
}

interface PersonBalance {
  participant: Participant;
  shouldPayCents: number;
  paidCents: number;
  netCents: number;
}

interface Transfer {
  from: string;
  to: string;
  cents: number;
}

interface DraftState {
  participants: Participant[];
  payments: Payment[];
  savedAt: string;
}

const createId = () => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex: string[] = [];
  for (const b of bytes) hex.push(b.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`;
};
const draftStorageKey = 'toolhub-aa-assistant-draft';
const nameHistoryStorageKey = 'toolhub-aa-assistant-name-history';
const toNumber = (value: string) => Math.max(Number(value) || 0, 0);
const toCents = (value: number) => Math.round(value * 100);
const formatAmountInput = (amount: number) => (amount > 0 ? amount.toFixed(2) : '');
const formatMoney = (cents: number) => `¥${(Math.abs(cents) / 100).toFixed(2)}`;
const getTotalPaid = (itemAmount: number, shipping: number, coupon: number) =>
  Math.max(itemAmount + shipping - coupon, 0);
const sumItemPrices = (participantIds: string[], itemPrices: Record<string, string>) =>
  participantIds.reduce((sum, personId) => sum + toNumber(itemPrices[personId] ?? ''), 0);
const parseSplitMode = (mode: unknown): SplitMode =>
  mode === 'total' ? 'total' : 'shippingRatio';
const splitCentsEvenly = (totalCents: number, count: number) => {
  if (count <= 0) return [];
  const base = Math.floor(totalCents / count);
  const remainder = totalCents - base * count;
  return Array.from({ length: count }, (_, index) => base + (index < remainder ? 1 : 0));
};

const createPayment = (participants: Participant[]): Payment => ({
  id: createId(),
  itemName: '',
  itemAmount: '',
  shipping: '',
  coupon: '',
  payerId: participants[0]?.id ?? '',
  participantIds: participants.map((person) => person.id),
  mode: 'total',
  itemPrices: Object.fromEntries(participants.map((person) => [person.id, ''])),
  saved: false,
  collapsed: false,
});

const initialParticipants: Participant[] = [];

const createInitialPayments = () => [createPayment(initialParticipants)];

function readDraft(): DraftState | null {
  try {
    const rawDraft = window.localStorage.getItem(draftStorageKey);
    if (!rawDraft) return null;
    const draft = JSON.parse(rawDraft) as Partial<DraftState>;
    if (!Array.isArray(draft.participants) || !Array.isArray(draft.payments)) {
      return null;
    }
    const participants = draft.participants.filter(
      (person): person is Participant =>
        typeof person?.id === 'string' && typeof person?.name === 'string',
    );
    const participantIds = participants.map((person) => person.id);
    const payments = draft.payments.map((payment) => ({
      id: typeof payment.id === 'string' ? payment.id : createId(),
      itemName: typeof payment.itemName === 'string' ? payment.itemName : '',
      itemAmount: typeof payment.itemAmount === 'string' ? payment.itemAmount : '',
      shipping: typeof payment.shipping === 'string' ? payment.shipping : '',
      coupon: typeof payment.coupon === 'string' ? payment.coupon : '',
      payerId: typeof payment.payerId === 'string' ? payment.payerId : participantIds[0] ?? '',
      participantIds: Array.isArray(payment.participantIds) ? payment.participantIds : participantIds,
      mode: parseSplitMode(payment.mode),
      itemPrices:
        payment.itemPrices && typeof payment.itemPrices === 'object' && !Array.isArray(payment.itemPrices)
          ? payment.itemPrices
          : Object.fromEntries(participantIds.map((personId) => [personId, ''])),
      saved: Boolean(payment.saved),
      collapsed: Boolean(payment.collapsed),
    }));
    return {
      participants,
      payments,
      savedAt: typeof draft.savedAt === 'string' ? draft.savedAt : '',
    };
  } catch {
    return null;
  }
}

function writeDraft(participants: Participant[], payments: Payment[]) {
  const draft: DraftState = {
    participants,
    payments,
    savedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(draftStorageKey, JSON.stringify(draft));
  return draft.savedAt;
}

function formatDraftTime(savedAt: string) {
  if (!savedAt) return '尚未暂存';
  const date = new Date(savedAt);
  if (Number.isNaN(date.getTime())) return '暂存时间未知';
  return `已暂存 ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
}

function readNameHistory() {
  try {
    const rawHistory = window.localStorage.getItem(nameHistoryStorageKey);
    if (!rawHistory) return [];
    const history = JSON.parse(rawHistory);
    if (!Array.isArray(history)) return [];
    return history.filter((name): name is string => typeof name === 'string' && name.trim().length > 0);
  } catch {
    return [];
  }
}

function writeNameHistory(history: string[]) {
  window.localStorage.setItem(nameHistoryStorageKey, JSON.stringify(history));
}

function mergeNameHistory(history: string[], name: string) {
  const normalized = name.trim().toLowerCase();
  const exists = history.some((item) => item.trim().toLowerCase() === normalized);
  if (exists) return history;
  return [...history, name.trim()].slice(-24);
}

function calculatePaymentBalances(participants: Participant[], payment: Payment) {
  const balances = new Map(
    participants.map((person) => [
      person.id,
      { participant: person, shouldPayCents: 0, paidCents: 0, netCents: 0 },
    ]),
  );

  if (participants.length === 0) {
    return [];
  }

  const activeParticipants = participants.filter((person) => payment.participantIds.includes(person.id));
  if (activeParticipants.length === 0) {
    return Array.from(balances.values()).map((balance) => ({
      ...balance,
      netCents: balance.paidCents - balance.shouldPayCents,
    }));
  }

  const payer = balances.get(payment.payerId);
  const itemAmount = toNumber(payment.itemAmount);
  const shipping = toNumber(payment.shipping);
  const coupon = toNumber(payment.coupon);
  const productPaid = Math.max(itemAmount - coupon, 0);
  const totalBeforeDiscount = itemAmount + shipping;
  const totalPaid = getTotalPaid(itemAmount, shipping, coupon);
  const actualPaidCents = toCents(payment.mode === 'shipping' ? productPaid + shipping : totalPaid);

  if (payer) {
    payer.paidCents += actualPaidCents;
  }

  if (payment.mode === 'total') {
    const shares = splitCentsEvenly(actualPaidCents, activeParticipants.length);
    for (const [index, person] of activeParticipants.entries()) {
      balances.get(person.id)!.shouldPayCents += shares[index];
    }
  } else if (payment.mode === 'shipping') {
    const discount = itemAmount > 0 ? productPaid / itemAmount : 0;
    const shippingShares = splitCentsEvenly(toCents(shipping), activeParticipants.length);

    for (const [index, person] of activeParticipants.entries()) {
      const originalPrice = toNumber(payment.itemPrices[person.id] ?? '');
      const productShareCents = toCents(originalPrice * discount);
      balances.get(person.id)!.shouldPayCents += productShareCents + shippingShares[index];
    }
  } else {
    const discount = totalBeforeDiscount > 0 ? totalPaid / totalBeforeDiscount : 0;

    for (const person of activeParticipants) {
      const originalPrice = toNumber(payment.itemPrices[person.id] ?? '');
      const ratio = itemAmount > 0 ? originalPrice / itemAmount : 0;
      const productShare = originalPrice * discount;
      const shippingShare = shipping * discount * ratio;
      balances.get(person.id)!.shouldPayCents += toCents(productShare + shippingShare);
    }
  }

  return Array.from(balances.values()).map((balance) => ({
    ...balance,
    netCents: balance.paidCents - balance.shouldPayCents,
  }));
}

function calculateBalances(participants: Participant[], payments: Payment[]) {
  const balances = new Map(
    participants.map((person) => [
      person.id,
      { participant: person, shouldPayCents: 0, paidCents: 0, netCents: 0 },
    ]),
  );

  if (participants.length === 0) {
    return [];
  }

  for (const payment of payments) {
    const paymentBalances = calculatePaymentBalances(participants, payment);
    for (const paymentBalance of paymentBalances) {
      const balance = balances.get(paymentBalance.participant.id);
      if (!balance) continue;
      balance.shouldPayCents += paymentBalance.shouldPayCents;
      balance.paidCents += paymentBalance.paidCents;
    }
  }

  return Array.from(balances.values()).map((balance) => ({
    ...balance,
    netCents: balance.paidCents - balance.shouldPayCents,
  }));
}

function calculateTransfers(balances: PersonBalance[]): Transfer[] {
  const debtors = balances
    .filter((balance) => balance.netCents < 0)
    .map((balance) => ({ name: balance.participant.name, cents: -balance.netCents }));
  const creditors = balances
    .filter((balance) => balance.netCents > 0)
    .map((balance) => ({ name: balance.participant.name, cents: balance.netCents }));
  const transfers: Transfer[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const cents = Math.min(debtor.cents, creditor.cents);

    if (cents > 0) {
      transfers.push({ from: debtor.name, to: creditor.name, cents });
    }

    debtor.cents -= cents;
    creditor.cents -= cents;

    if (debtor.cents === 0) debtorIndex += 1;
    if (creditor.cents === 0) creditorIndex += 1;
  }

  return transfers;
}

function modeLabel(mode: SplitMode) {
  return mode === 'total' ? '按总价 AA' : '按个人填入原始金额';
}

function createExportText(participants: Participant[], payments: Payment[], balances: PersonBalance[], transfers: Transfer[]) {
  const lines = [
    'AA 结算结果',
    `导出时间：${new Date().toLocaleString()}`,
    '',
    `参与人：${participants.map((person) => person.name).join('、') || '无'}`,
    '',
    '付款明细：',
  ];

  payments.forEach((payment, index) => {
    const payerName = participants.find((person) => person.id === payment.payerId)?.name ?? '未选择';
    const activeParticipants = participants.filter((person) => payment.participantIds.includes(person.id));
    const itemAmount = toNumber(payment.itemAmount);
    const shipping = toNumber(payment.shipping);
    const coupon = toNumber(payment.coupon);
    const totalPaid = payment.mode === 'shipping'
      ? Math.max(itemAmount - coupon, 0) + shipping
      : getTotalPaid(itemAmount, shipping, coupon);

    lines.push(
      `${index + 1}. ${payment.itemName.trim() || `付款 ${index + 1}`}`,
      `   付款人：${payerName}`,
      `   参与人：${activeParticipants.map((person) => person.name).join('、') || '无'}`,
      `   商品金额：${formatMoney(toCents(itemAmount))}，运费：${formatMoney(toCents(shipping))}，优惠券：${formatMoney(toCents(coupon))}`,
      `   AA 方式：${modeLabel(payment.mode)}，实付：${formatMoney(toCents(totalPaid))}`,
    );
  });

  lines.push('', '个人结果：');
  balances.forEach((balance) => {
    lines.push(
      `${balance.participant.name}：应承担 ${formatMoney(balance.shouldPayCents)}，已付款 ${formatMoney(balance.paidCents)}，${
        balance.netCents >= 0 ? `应收 ${formatMoney(balance.netCents)}` : `应付 ${formatMoney(balance.netCents)}`
      }`,
    );
  });

  lines.push('', '转账建议：');
  if (transfers.length === 0) {
    lines.push('当前无需转账。');
  } else {
    transfers.forEach((transfer) => {
      lines.push(`${transfer.from} 转给 ${transfer.to} ${formatMoney(transfer.cents)}`);
    });
  }

  return `${lines.join('\n')}\n`;
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function AaAssistant() {
  const [initialDraft] = useState(readDraft);
  const [participants, setParticipants] = useState(() => initialDraft?.participants ?? initialParticipants);
  const [participantName, setParticipantName] = useState('');
  const [payments, setPayments] = useState<Payment[]>(
    () => initialDraft?.payments ?? createInitialPayments(),
  );
  const [draftSavedAt, setDraftSavedAt] = useState(initialDraft?.savedAt ?? '');
  const [nameHistory, setNameHistory] = useState(readNameHistory);

  const balances = useMemo(() => calculateBalances(participants, payments), [participants, payments]);
  const transfers = useMemo(() => calculateTransfers(balances), [balances]);

  const saveDraft = () => {
    setDraftSavedAt(writeDraft(participants, payments));
  };

  const restoreDraft = () => {
    const draft = readDraft();
    if (!draft) return;
    setParticipants(draft.participants);
    setPayments(draft.payments);
    setDraftSavedAt(draft.savedAt);
  };

  const resetDraft = () => {
    window.localStorage.removeItem(draftStorageKey);
    setParticipants(initialParticipants);
    setPayments(createInitialPayments());
    setParticipantName('');
    setDraftSavedAt('');
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDraftSavedAt(writeDraft(participants, payments));
    }, 5000);
    return () => window.clearInterval(timer);
  }, [participants, payments]);

  const addParticipant = (rawName = participantName) => {
    const name = rawName.trim();
    if (!name) return;

    const exists = participants.some((person) => person.name.trim().toLowerCase() === name.toLowerCase());
    if (exists) {
      setParticipantName('');
      return;
    }

    const participant = { id: createId(), name };
    setParticipants((current) => [...current, participant]);
    setPayments((current) =>
      current.map((payment) => ({
        ...payment,
        saved: false,
        collapsed: false,
        payerId: payment.payerId || participant.id,
        participantIds: [...payment.participantIds, participant.id],
        itemPrices: { ...payment.itemPrices, [participant.id]: '' },
      })),
    );
    setNameHistory((current) => {
      const nextHistory = mergeNameHistory(current, name);
      writeNameHistory(nextHistory);
      return nextHistory;
    });
    setParticipantName('');
  };

  const removeHistoryName = (name: string) => {
    setNameHistory((current) => {
      const normalized = name.trim().toLowerCase();
      const nextHistory = current.filter((item) => item.trim().toLowerCase() !== normalized);
      writeNameHistory(nextHistory);
      return nextHistory;
    });
  };

  const removeParticipant = (participantId: string) => {
    setParticipants((current) => current.filter((person) => person.id !== participantId));
    setPayments((current) =>
      current.map((payment) => {
        const itemPrices = { ...payment.itemPrices };
        delete itemPrices[participantId];
        const participantIds = payment.participantIds.filter((id) => id !== participantId);
        const fallbackPayerId = participants.find((person) => person.id !== participantId)?.id ?? '';
        return {
          ...payment,
          saved: false,
          collapsed: false,
          payerId: payment.payerId === participantId ? fallbackPayerId : payment.payerId,
          participantIds,
          itemAmount: formatAmountInput(sumItemPrices(participantIds, itemPrices)),
          itemPrices,
        };
      }),
    );
  };

  const updatePayment = (paymentId: string, patch: Partial<Payment>) => {
    setPayments((current) =>
      current.map((payment) =>
        payment.id === paymentId
          ? {
              ...payment,
              ...patch,
              saved: patch.saved ?? false,
              collapsed: patch.saved ? true : false,
            }
          : payment,
      ),
    );
  };

  const updateItemPrice = (paymentId: string, participantId: string, value: string) => {
    setPayments((current) =>
      current.map((payment) =>
        payment.id === paymentId
          ? (() => {
              const itemPrices = { ...payment.itemPrices, [participantId]: value };
              return {
                ...payment,
                saved: false,
                collapsed: false,
                itemAmount: formatAmountInput(sumItemPrices(payment.participantIds, itemPrices)),
                itemPrices,
              };
            })()
          : payment,
      ),
    );
  };

  const togglePaymentParticipant = (paymentId: string, participantId: string) => {
    setPayments((current) =>
      current.map((payment) => {
        if (payment.id !== paymentId) return payment;
        const selected = payment.participantIds.includes(participantId);
        const participantIds = selected
          ? payment.participantIds.filter((id) => id !== participantId)
          : [...payment.participantIds, participantId];
        return {
          ...payment,
          saved: false,
          collapsed: false,
          participantIds,
          itemAmount: formatAmountInput(sumItemPrices(participantIds, payment.itemPrices)),
        };
      }),
    );
  };

  const togglePaymentCollapsed = (paymentId: string) => {
    setPayments((current) =>
      current.map((payment) =>
        payment.id === paymentId ? { ...payment, collapsed: !payment.collapsed } : payment,
      ),
    );
  };

  const exportResult = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadTextFile(`aa-result-${timestamp}.txt`, createExportText(participants, payments, balances, transfers));
  };

  return (
    <div className="tool-panel aa-tool">
      <section className="aa-draft-bar">
        <div>
          <strong>本地暂存</strong>
          <span>{formatDraftTime(draftSavedAt)}</span>
        </div>
        <div className="aa-draft-actions">
          <button className="command-button" onClick={saveDraft}>
            <Save size={18} />
            暂存
          </button>
          <button className="command-button" onClick={restoreDraft}>
            <RotateCcw size={18} />
            恢复
          </button>
          <button className="command-button" onClick={resetDraft}>
            <Trash2 size={18} />
            重新开始
          </button>
        </div>
      </section>

      <section className="aa-section">
        <div className="section-heading">
          <h3>参与人</h3>
          <span>{participants.length} 人</span>
        </div>
        <div className="tool-controls">
          <label className="field compact wide">
            <span>姓名</span>
            <input
              value={participantName}
              onChange={(event) => setParticipantName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addParticipant(event.currentTarget.value);
                }
              }}
              placeholder="输入姓名"
            />
          </label>
          <button className="command-button" onClick={() => addParticipant()}>
            <Plus size={18} />
            添加参与人
          </button>
          {nameHistory.length > 0 && (
            <div className="name-history">
              <span>历史姓名</span>
              <div className="name-history-list">
                {nameHistory.map((name) => (
                  <span className="history-name-chip" key={name}>
                    <button onClick={() => addParticipant(name)}>{name}</button>
                    <button onClick={() => removeHistoryName(name)} title="删除历史姓名">
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="participant-list">
          {participants.map((person) => (
            <span className="person-chip" key={person.id}>
              {person.name}
              <button onClick={() => removeParticipant(person.id)} title="删除参与人">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      </section>

      <section className="aa-section">
        <div className="section-heading">
          <h3>付款信息</h3>
          <button className="command-button" onClick={() => setPayments([createPayment(participants), ...payments])}>
            <Plus size={18} />
            添加付款
          </button>
        </div>

        <div className="payment-list">
          {payments.map((payment, index) => {
            const productPaid = Math.max(toNumber(payment.itemAmount) - toNumber(payment.coupon), 0);
            const discount = toNumber(payment.itemAmount) > 0 ? productPaid / toNumber(payment.itemAmount) : 0;
            const totalBeforeDiscount = toNumber(payment.itemAmount) + toNumber(payment.shipping);
            const totalPaid = getTotalPaid(
              toNumber(payment.itemAmount),
              toNumber(payment.shipping),
              toNumber(payment.coupon),
            );
            const ratioDiscount = totalBeforeDiscount > 0 ? totalPaid / totalBeforeDiscount : 0;
            const displayedDiscount = payment.mode === 'shippingRatio' ? ratioDiscount : discount;
            const displayedPaid =
              payment.mode === 'shipping' ? productPaid + toNumber(payment.shipping) : totalPaid;
            const paymentBalances = calculatePaymentBalances(participants, payment);
            const paymentTitle = payment.itemName.trim() || `付款 ${index + 1}`;
            const activeParticipants = participants.filter((person) => payment.participantIds.includes(person.id));

            return (
              <article className={payment.collapsed ? 'payment-card collapsed' : 'payment-card'} key={payment.id}>
                <div className="payment-header">
                  <button className="payment-title-button" onClick={() => togglePaymentCollapsed(payment.id)}>
                    {payment.collapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                    <span>
                      <strong>{paymentTitle}</strong>
                      <small>
                        {activeParticipants.length} 人参与，实付 {formatMoney(toCents(displayedPaid))}
                      </small>
                    </span>
                  </button>
                  <div className="payment-actions">
                    <button className="command-button" onClick={() => updatePayment(payment.id, { saved: true })}>
                      <Save size={18} />
                      保存
                    </button>
                    <button
                      className="icon-button"
                      onClick={() => setPayments(payments.filter((item) => item.id !== payment.id))}
                      title="删除付款"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {!payment.collapsed && (
                  <>
                    <div className="form-grid">
                      <label className="field">
                        <span>商品名称</span>
                        <input
                          value={payment.itemName}
                          onChange={(event) => updatePayment(payment.id, { itemName: event.target.value })}
                          placeholder="例如：晚餐、团购、外卖"
                        />
                      </label>
                      <label className="field">
                        <span>商品金额</span>
                        <input
                          inputMode="decimal"
                          value={payment.itemAmount}
                          onChange={(event) => updatePayment(payment.id, { itemAmount: event.target.value })}
                          placeholder="0.00"
                        />
                      </label>
                      <label className="field">
                        <span>运费</span>
                        <input
                          inputMode="decimal"
                          value={payment.shipping}
                          onChange={(event) => updatePayment(payment.id, { shipping: event.target.value })}
                          placeholder="0.00"
                        />
                      </label>
                      <label className="field">
                        <span>优惠券</span>
                        <input
                          inputMode="decimal"
                          value={payment.coupon}
                          onChange={(event) => updatePayment(payment.id, { coupon: event.target.value })}
                          placeholder="0.00"
                        />
                      </label>
                      <label className="field">
                        <span>付款人</span>
                        <select
                          value={payment.payerId}
                          onChange={(event) => updatePayment(payment.id, { payerId: event.target.value })}
                        >
                          <option value="">请选择</option>
                          {participants.map((person) => (
                            <option key={person.id} value={person.id}>
                              {person.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="payment-participants">
                      <span>参与人</span>
                      <div className="participant-toggle-list">
                        {participants.map((person) => (
                          <label className="participant-toggle" key={person.id}>
                            <input
                              type="checkbox"
                              checked={payment.participantIds.includes(person.id)}
                              onChange={() => togglePaymentParticipant(payment.id, person.id)}
                            />
                            <span>{person.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="segmented" aria-label="AA 方式">
                      <button className={payment.mode === 'total' ? 'active' : ''} onClick={() => updatePayment(payment.id, { mode: 'total' })}>
                        按总价 AA
                      </button>
                      <button
                        className={payment.mode === 'shippingRatio' ? 'active' : ''}
                        onClick={() => updatePayment(payment.id, { mode: 'shippingRatio' })}
                      >
                        按个人填入原始金额
                      </button>
                    </div>

                    {payment.mode !== 'total' && (
                      <div className="person-price-grid">
                        {activeParticipants.map((person) => (
                          <label className="field" key={person.id}>
                            <span>{person.name} 原始价格</span>
                            <input
                              inputMode="decimal"
                              value={payment.itemPrices[person.id] ?? ''}
                              onChange={(event) => updateItemPrice(payment.id, person.id, event.target.value)}
                              placeholder="0.00"
                            />
                          </label>
                        ))}
                      </div>
                    )}

                    <div className="payment-note">
                      <Calculator size={16} />
                      <span>
                        实付 {formatMoney(toCents(displayedPaid))}，
                        {payment.mode === 'shippingRatio' ? '整单折扣' : '商品折扣'}{' '}
                        {(displayedDiscount * 100).toFixed(2)}%
                      </span>
                    </div>
                  </>
                )}

                {payment.saved && (
                  payment.collapsed ? (
                    <div className="payment-compact-summary">
                      <div>
                        <span>金额</span>
                        <strong>{formatMoney(toCents(displayedPaid))}</strong>
                        <small>
                          {payment.mode === 'shippingRatio' ? '整单折扣' : '商品折扣'}{' '}
                          {(displayedDiscount * 100).toFixed(2)}%
                        </small>
                      </div>
                      <div>
                        <span>参与</span>
                        <strong>{activeParticipants.map((person) => person.name).join('、') || '未选择'}</strong>
                        <small>{activeParticipants.length} 人</small>
                      </div>
                      <div>
                        <span>本条结算</span>
                        <div className="compact-balance-list">
                          {paymentBalances
                            .filter((balance) => payment.participantIds.includes(balance.participant.id) || balance.paidCents > 0)
                            .map((balance) => (
                              <strong
                                className={balance.netCents >= 0 ? 'positive-money' : 'negative-money'}
                                key={balance.participant.id}
                              >
                                {balance.participant.name}{' '}
                                {balance.netCents >= 0 ? `应收 ${formatMoney(balance.netCents)}` : `应付 ${formatMoney(balance.netCents)}`}
                              </strong>
                            ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="payment-balance-table">
                    <div className="payment-balance-row header">
                      <span>参与人</span>
                      <span>本条应承担</span>
                      <span>本条已付款</span>
                      <span>本条结果</span>
                    </div>
                    {paymentBalances.map((balance) => (
                      <div className="payment-balance-row" key={balance.participant.id}>
                        <strong>{balance.participant.name}</strong>
                        <span>{formatMoney(balance.shouldPayCents)}</span>
                        <span>{formatMoney(balance.paidCents)}</span>
                        <strong className={balance.netCents >= 0 ? 'positive-money' : 'negative-money'}>
                          {balance.netCents >= 0
                            ? `应收 ${formatMoney(balance.netCents)}`
                            : `应付 ${formatMoney(balance.netCents)}`}
                        </strong>
                      </div>
                    ))}
                  </div>
                  )
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="aa-section">
        <div className="section-heading">
          <h3>结算结果</h3>
          <button className="command-button" onClick={exportResult}>
            <Download size={18} />
            导出结果
          </button>
        </div>
        <div className="balance-table">
          <div className="balance-row header">
            <span>姓名</span>
            <span>应承担</span>
            <span>已付款</span>
            <span>结果</span>
          </div>
          {balances.map((balance) => (
            <div className="balance-row" key={balance.participant.id}>
              <strong>{balance.participant.name}</strong>
              <span>{formatMoney(balance.shouldPayCents)}</span>
              <span>{formatMoney(balance.paidCents)}</span>
              <strong className={balance.netCents >= 0 ? 'positive-money' : 'negative-money'}>
                {balance.netCents >= 0 ? `应收 ${formatMoney(balance.netCents)}` : `应付 ${formatMoney(balance.netCents)}`}
              </strong>
            </div>
          ))}
        </div>

        <div className="transfer-list">
          {transfers.length === 0 ? (
            <div className="empty-state">当前无需转账。</div>
          ) : (
            transfers.map((transfer) => (
              <div key={`${transfer.from}-${transfer.to}-${transfer.cents}`}>
                <span>{transfer.from}</span>
                <strong>转给</strong>
                <span>{transfer.to}</span>
                <strong>{formatMoney(transfer.cents)}</strong>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
