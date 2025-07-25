import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BulkUploadSimple from '../components/BulkUploadSimple';
import {
  pageWrapper,
  boxedContainer,
  containerHeader,
  containerContent,
  h2,
  primaryButton,
  primaryButtonHover,
  buttonDisabled,
  backButtonBase,
  backButtonHover,
} from '../App.styles';

// Styles specific to this page
const styles = {
  pageContainer: {
    ...pageWrapper,
    padding: '2rem',
  },
  header: {
    ...h2,
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tenantSelector: {
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '0.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  },
  tenantSelectorTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: '1rem',
  },
  tenantDropdown: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '0.375rem',
    border: '1px solid #ced4da',
    backgroundColor: '#fff',
    cursor: 'pointer',
    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
    // pseudo-classes are not supported in inline styles – handle focus via CSS class if needed
  },
  backButton: {
    ...backButtonBase,
    marginRight: 'auto',
  },
  godModeIndicator: {
    display: 'inline-block',
    padding: '0.25rem 0.5rem',
    backgroundColor: '#FFA500',
    color: '#fff',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    marginLeft: '0.5rem',
  },
  noAccessMessage: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    textAlign: 'center' as const,
    backgroundColor: '#f8f9fa',
    borderRadius: '0.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  },
  noAccessIcon: {
    fontSize: '3rem',
    color: '#dc3545',
    marginBottom: '1rem',
  },
  noAccessTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  noAccessText: {
    fontSize: '1rem',
    color: '#6c757d',
    marginBottom: '1.5rem',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
  },
  loadingSpinner: {
    width: '3rem',
    height: '3rem',
    border: '0.25rem solid rgba(0, 0, 0, 0.1)',
    borderRadius: '50%',
    borderTop: '0.25rem solid #FFA500',
    animation: 'spin 1s linear infinite',
    '@keyframes spin': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
  },
};

interface Tenant {
  id: string;
  name: string;
}

interface UploadResult {
  success: boolean;
  message: string;
  processed: {
    categories: number;
    questions: number;
  };
  created: {
    categories: number;
    questions: number;
  };
  updated: {
    categories: number;
    questions: number;
  };
  skipped: {
    categories: number;
    questions: number;
  };
  errors: {
    line?: number;
    category?: string;
    question?: string;
    message: string;
  }[];
  dryRun: boolean;
}

interface BulkUploadPageProps {
  godMode: boolean;
}

const BulkUploadPage: React.FC<BulkUploadPageProps> = ({ godMode }) => {
  const navigate = useNavigate();
  
  // State
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadComplete, setUploadComplete] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  // Fetch tenants on component mount
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:4000/tenants');
        setTenants(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tenants:', err);
        setError('Failed to load teams. Please try again later.');
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  // Handle tenant selection
  const handleTenantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tenantId = e.target.value;
    if (!tenantId) {
      setSelectedTenant(null);
      return;
    }

    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      setSelectedTenant(tenant);
      // Reset upload state when tenant changes
      setUploadComplete(false);
      setUploadResult(null);
    }
  };

  // Handle upload completion
  const handleUploadComplete = (result: UploadResult) => {
    setUploadComplete(true);
    setUploadResult(result);
    
    // If successful and not a dry run, refresh tenant data
    if (result.success && !result.dryRun) {
      // You might want to refresh categories or other data here
      console.log('Upload successful:', result);
    }
  };

  // Navigate back
  const handleBack = () => {
    navigate(-1);
  };

  // Render loading state
  if (loading) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.header}>
          <button style={styles.backButton} onClick={handleBack}>
            &larr; Back
          </button>
          <h1>Bulk Upload</h1>
        </div>
        <div style={styles.noAccessMessage}>
          <div style={styles.noAccessIcon}>⚠️</div>
          <div style={styles.noAccessTitle}>Error</div>
          <div style={styles.noAccessText}>{error}</div>
          <button 
            style={{...primaryButton}}
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render no access state if not in God Mode
  if (!godMode) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.header}>
          <button style={styles.backButton} onClick={handleBack}>
            &larr; Back
          </button>
          <h1>Bulk Upload</h1>
        </div>
        <div style={styles.noAccessMessage}>
          <div style={styles.noAccessIcon}>🔒</div>
          <div style={styles.noAccessTitle}>Admin Access Required</div>
          <div style={styles.noAccessText}>
            You need to be in God Mode to access the bulk upload feature.
          </div>
          <button 
            style={{...primaryButton}}
            onClick={() => navigate('/')}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={handleBack}>
          &larr; Back
        </button>
        <h1>
          Bulk Upload
          <span style={styles.godModeIndicator}>GOD MODE</span>
        </h1>
      </div>

      <div style={{...boxedContainer, width: '90%', maxWidth: '1200px'}}>
        <div style={containerHeader}>
          <h2>Upload Categories & Questions</h2>
        </div>
        
        <div style={containerContent}>
          {/* Tenant Selector */}
          <div style={styles.tenantSelector}>
            <div style={styles.tenantSelectorTitle}>Select a Team</div>
            <select 
              style={styles.tenantDropdown}
              value={selectedTenant?.id || ''}
              onChange={handleTenantChange}
            >
              <option value="">-- Select a Team --</option>
              {tenants.map(tenant => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bulk Upload Component */}
          {selectedTenant ? (
            <BulkUploadSimple 
              tenantId={selectedTenant.id}
              onComplete={handleUploadComplete}
              apiUrl="http://localhost:4000"
            />
          ) : (
            <div style={styles.noAccessMessage}>
              <div style={styles.noAccessText}>
                Please select a team to continue with bulk upload.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkUploadPage;
