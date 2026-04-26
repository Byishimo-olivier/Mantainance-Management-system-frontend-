import React, { useEffect, useMemo, useState } from 'react';
import subscriptionAPI from '../../api/subscription';
import { AlertCircle, CheckCircle2, Loader2, Smartphone, XCircle } from 'lucide-react';

const SUCCESS_STATUSES = new Set(['completed', 'paid', 'success', 'successful', 'active']);
const FAILURE_STATUSES = new Set(['failed', 'cancelled', 'canceled', 'rejected', 'declined', 'expired']);

const normalizeStatus = (value) => String(value || '').trim().toLowerCase();

const MobileMoneyPendingModal = ({
  open,
  paymentId = '',
  requestTransactionId = '',
  transactionId = '',
  provider = 'mtn',
  phoneNumber = '',
  amount = 0,
  currency = 'RWF',
  planName = 'Subscription',
  initialMessage = '',
  onClose,
  onSuccess,
}) => {
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState(initialMessage);
  const [pollError, setPollError] = useState('');

  const providerLabel = useMemo(() => {
    if (provider === 'airtel') return 'Airtel Money';
    return 'MTN Mobile Money';
  }, [provider]);

  useEffect(() => {
    if (!open) {
      setStatus('pending');
      setMessage(initialMessage);
      setPollError('');
      return;
    }

    let cancelled = false;
    let timeoutId = null;

    const pollStatus = async () => {
      try {
        const response = await subscriptionAPI.getMobileMoneyPaymentStatus({
          paymentId,
          requestTransactionId,
          transactionId,
        });

        if (cancelled) {
          return;
        }

        const payment = response?.data || response || {};
        const nextStatus = normalizeStatus(payment?.status || payment?.paymentStatus);
        const nextMessage =
          payment?.failureReason ||
          payment?.statusMessage ||
          payment?.metadata?.intouchpayMessage ||
          payment?.message ||
          initialMessage;

        setMessage(nextMessage || '');
        setPollError('');

        if (SUCCESS_STATUSES.has(nextStatus)) {
          setStatus('completed');
          if (onSuccess) {
            await onSuccess(payment);
          }
          return;
        }

        if (FAILURE_STATUSES.has(nextStatus)) {
          setStatus('failed');
          return;
        }

        setStatus('pending');
      } catch (error) {
        if (cancelled) {
          return;
        }

        setPollError(error?.error || error?.message || 'Unable to refresh payment status right now.');
      }

      if (!cancelled) {
        timeoutId = window.setTimeout(pollStatus, 5000);
      }
    };

    pollStatus();

    return () => {
      cancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [initialMessage, onSuccess, open, paymentId, requestTransactionId, transactionId]);

  if (!open) {
    return null;
  }

  const amountLabel = `${currency} ${Math.round(Number(amount || 0))}`;
  const resolvedMessage =
    message ||
    (status === 'failed'
      ? 'Payment could not be completed. Please try again.'
      : 'Approve the payment on your phone. We are checking your payment automatically.');

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
        <div className="border-b border-gray-100 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Mobile Money Payment</h3>
              <p className="mt-1 text-sm text-slate-500">
                Stay on this screen while we confirm your {planName} subscription payment.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-200 px-3 py-1 text-sm font-semibold text-slate-500 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm font-semibold text-blue-700">Payment Request Sent</div>
                <div className="text-base font-bold text-slate-900">{providerLabel}</div>
              </div>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <div>
                <div className="font-semibold text-slate-700">Amount</div>
                <div>{amountLabel}</div>
              </div>
              <div>
                <div className="font-semibold text-slate-700">Phone</div>
                <div>{phoneNumber || 'Not provided'}</div>
              </div>
            </div>
          </div>

          <div
            className={`rounded-2xl border px-5 py-4 ${
              status === 'failed'
                ? 'border-red-200 bg-red-50'
                : status === 'completed'
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-amber-200 bg-amber-50'
            }`}
          >
            <div className="flex gap-3">
              {status === 'failed' ? (
                <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
              ) : status === 'completed' ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
              ) : (
                <Loader2 className="mt-0.5 h-5 w-5 animate-spin text-amber-600" />
              )}
              <div>
                <div className="font-semibold text-slate-900">
                  {status === 'failed'
                    ? 'Payment failed'
                    : status === 'completed'
                      ? 'Payment received'
                      : 'Waiting for approval'}
                </div>
                <p className="mt-1 text-sm text-slate-600">{resolvedMessage}</p>
                {status === 'pending' && (
                  <p className="mt-2 text-xs font-medium text-amber-700">
                    Approve the request on your phone. This window refreshes automatically every 5 seconds.
                  </p>
                )}
              </div>
            </div>
          </div>

          {pollError && (
            <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
              <div className="flex gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{pollError}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-gray-50"
            >
              {status === 'pending' ? 'Hide for now' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMoneyPendingModal;
