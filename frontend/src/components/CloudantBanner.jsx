import React, { useState } from 'react';
import { Database, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

export const CloudantBanner = ({ dbStatus, onRetry }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const isConnected = dbStatus?.connected;
  const isConfigured = dbStatus?.configured;

  const exampleEnv = `CLOUDANT_URL=https://your-instance.cloudantnosqldb.appdomain.cloud
CLOUDANT_APIKEY=your_ibm_cloudant_iam_apikey
CLOUDANT_DB_NAME=spendwise_db`;

  const copyEnv = () => {
    navigator.clipboard.writeText(exampleEnv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isConnected) {
    return (
      <div id="cloudant-connected-banner" className="cloudant-banner connected">
        <div className="cloudant-banner-content">
          <div className="cloudant-banner-title">
            <CheckCircle2 size={18} color="var(--accent-emerald)" />
            <span>IBM Cloudant NoSQL Database Connected</span>
          </div>
          <p className="cloudant-banner-desc">
            Live database: <code className="cloudant-banner-code">{dbStatus.dbName}</code> &bull; Total Cloudant documents: <strong>{dbStatus.docCount || 0}</strong>. All changes are persisted directly to IBM Cloud.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="cloudant-setup-banner" className="cloudant-banner">
      <div className="cloudant-banner-content">
        <div className="cloudant-banner-title">
          <AlertTriangle size={18} color="var(--accent-amber)" />
          <span>IBM Cloudant Configuration Setup</span>
        </div>
        <p className="cloudant-banner-desc">
          {isConfigured
            ? 'Backend is attempting to establish a connection with IBM Cloudant. Make sure your network or API keys allow connection.'
            : 'To store expenses in IBM Cloudant NoSQL database, configure your Cloudant credentials in backend/.env.'}
        </p>

        {isExpanded && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              1. Log into your free IBM Cloud account &rarr; Create a <strong>Cloudant</strong> instance (Lite plan is free).<br />
              2. Go to <strong>Service credentials</strong> &rarr; Click <strong>New credential</strong>.<br />
              3. Copy the <code className="cloudant-banner-code">url</code> and <code className="cloudant-banner-code">apikey</code> into <code className="cloudant-banner-code">backend/.env</code>:
            </p>
            <div style={{ position: 'relative', marginTop: '0.5rem' }}>
              <pre
                style={{
                  background: 'rgba(0,0,0,0.6)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  color: '#fde68a',
                  overflowX: 'auto'
                }}
              >
                {exampleEnv}
              </pre>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={copyEnv}
                style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
              Note: The database <code className="cloudant-banner-code">spendwise_db</code> will be created automatically upon connection.
            </p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <span>{isExpanded ? 'Hide Guide' : 'Setup Guide'}</span>
        </button>
      </div>
    </div>
  );
};

export default CloudantBanner;
