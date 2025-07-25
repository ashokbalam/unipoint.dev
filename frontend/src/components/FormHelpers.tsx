import React, { ReactNode, useState, useEffect } from 'react';

// ===================================================================
// INTERFACES
// ===================================================================

interface FormTipsProps {
  /** Category of tips to show (team, category, question) */
  category: 'team' | 'category' | 'question' | string;
  /** Custom tips to override defaults */
  customTips?: string[];
  /** Optional title override */
  title?: string;
}

interface FormProgressProps {
  /** Current step number */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Labels for each step */
  stepLabels?: string[];
  /** Optional title override */
  title?: string;
}

interface RecentItemProps {
  /** ID of the item */
  id: string;
  /** Name of the item */
  name: string;
  /** When the item was created */
  createdAt: string | Date;
  /** Optional metadata or description */
  meta?: string;
  /** Optional click handler */
  onClick?: (id: string) => void;
}

interface RecentItemsProps {
  /** Type of items being displayed */
  itemType: 'team' | 'category' | 'question' | string;
  /** List of recent items */
  items: RecentItemProps[];
  /** Maximum number of items to show */
  maxItems?: number;
  /** Optional title override */
  title?: string;
  /** Optional loading state */
  loading?: boolean;
  /** Optional error message */
  error?: string;
}

interface FormPreviewProps {
  /** Title of the preview */
  title?: string;
  /** Form data to preview */
  data: Record<string, any>;
  /** Template for how to render the preview */
  template?: 'team' | 'category' | 'question' | 'custom';
  /** Custom render function for the preview */
  customRender?: (data: Record<string, any>) => ReactNode;
}

interface QuickActionProps {
  /** Label for the action */
  label: string;
  /** Icon or symbol for the action (emoji or text) */
  icon?: string;
  /** Function to call when action is clicked */
  onClick: () => void;
  /** Whether the action is disabled */
  disabled?: boolean;
}

interface QuickActionsProps {
  /** Title for the quick actions section */
  title?: string;
  /** List of actions to display */
  actions: QuickActionProps[];
}

interface FormHelpersProps {
  /** Type of form being displayed */
  formType: 'team' | 'category' | 'question' | string;
  /** Which helper components to show */
  show?: {
    tips?: boolean;
    progress?: boolean;
    recentItems?: boolean;
    preview?: boolean;
    quickActions?: boolean;
  };
  /** Current form data for preview */
  formData?: Record<string, any>;
  /** Current step for multi-step forms */
  currentStep?: number;
  /** Total steps for multi-step forms */
  totalSteps?: number;
  /** Recent items data */
  recentItems?: RecentItemProps[];
  /** Quick actions */
  quickActions?: QuickActionProps[];
  /** Custom tips */
  customTips?: string[];
}

// ===================================================================
// STYLES
// ===================================================================

const helperContainer = {
  backgroundColor: '#f9fafb',
  borderRadius: '0.75rem',
  padding: '1rem',
  marginBottom: '1rem',
  border: '1px solid var(--color-border, #e5e7eb)',
  transition: 'all 0.2s ease',
};

const helperTitle = {
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'var(--color-text, #111827)',
  marginBottom: '0.5rem',
  fontFamily: 'var(--font-heading, sans-serif)',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const helperContent = {
  fontSize: '0.8125rem',
  color: 'var(--color-text-light, #4b5563)',
  fontFamily: 'var(--font-body, sans-serif)',
  lineHeight: 1.5,
};

const tipsList = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
};

const tipItem = {
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '0.5rem',
  gap: '0.5rem',
};

const tipIcon = {
  color: 'var(--color-secondary, #f97316)',
  flexShrink: 0,
};

const tipText = {
  flex: 1,
};

const progressContainer = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: '0.75rem',
  position: 'relative' as const,
};

const progressBar = {
  position: 'absolute' as const,
  height: '2px',
  backgroundColor: '#e5e7eb',
  left: 0,
  right: 0,
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 0,
};

const progressFill = {
  position: 'absolute' as const,
  height: '2px',
  backgroundColor: 'var(--color-primary, #6366f1)',
  left: 0,
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 1,
  transition: 'width 0.3s ease',
};

const stepCircle = {
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  backgroundColor: '#ffffff',
  border: '2px solid #e5e7eb',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.75rem',
  fontWeight: 600,
  position: 'relative' as const,
  zIndex: 2,
};

const activeStepCircle = {
  ...stepCircle,
  backgroundColor: 'var(--color-primary, #6366f1)',
  borderColor: 'var(--color-primary, #6366f1)',
  color: '#ffffff',
};

const completedStepCircle = {
  ...stepCircle,
  backgroundColor: 'var(--color-primary, #6366f1)',
  borderColor: 'var(--color-primary, #6366f1)',
  color: '#ffffff',
};

const stepLabel = {
  fontSize: '0.75rem',
  color: 'var(--color-text-light, #4b5563)',
  position: 'absolute' as const,
  top: '100%',
  left: '50%',
  transform: 'translateX(-50%)',
  marginTop: '0.25rem',
  whiteSpace: 'nowrap' as const,
  maxWidth: '80px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textAlign: 'center' as const,
};

const activeStepLabel = {
  ...stepLabel,
  color: 'var(--color-primary, #6366f1)',
  fontWeight: 600,
};

const recentItemsList = {
  marginTop: '0.5rem',
};

const recentItemCard = {
  padding: '0.5rem',
  borderRadius: '0.375rem',
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  marginBottom: '0.5rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const recentItemCardHover = {
  backgroundColor: '#f3f4f6',
  borderColor: 'var(--color-primary, #6366f1)',
  transform: 'translateY(-1px)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};

const recentItemName = {
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: 'var(--color-text, #111827)',
  marginBottom: '0.25rem',
};

const recentItemMeta = {
  fontSize: '0.75rem',
  color: 'var(--color-text-light, #4b5563)',
  display: 'flex',
  justifyContent: 'space-between',
};

const previewContainer = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '0.375rem',
  padding: '0.75rem',
  marginTop: '0.5rem',
};

const previewLabel = {
  fontSize: '0.75rem',
  color: 'var(--color-text-light, #4b5563)',
  marginBottom: '0.25rem',
};

const previewValue = {
  fontSize: '0.8125rem',
  fontWeight: 500,
  color: 'var(--color-text, #111827)',
};

const previewEmpty = {
  fontSize: '0.8125rem',
  color: '#9ca3af',
  fontStyle: 'italic',
  padding: '0.5rem 0',
};

const quickActionsList = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: '0.5rem',
  marginTop: '0.5rem',
};

const quickActionButton = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
  padding: '0.375rem 0.625rem',
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '0.375rem',
  fontSize: '0.75rem',
  color: 'var(--color-text, #111827)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const quickActionButtonHover = {
  backgroundColor: '#f3f4f6',
  borderColor: 'var(--color-primary, #6366f1)',
};

const quickActionButtonDisabled = {
  backgroundColor: '#f3f4f6',
  borderColor: '#e5e7eb',
  color: '#9ca3af',
  cursor: 'not-allowed',
};

const quickActionIcon = {
  fontSize: '0.875rem',
};

const loadingSpinner = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem 0',
  color: 'var(--color-text-light, #4b5563)',
};

const errorMessage = {
  color: '#ef4444',
  fontSize: '0.75rem',
  padding: '0.5rem 0',
};

// ===================================================================
// DEFAULT DATA
// ===================================================================

// Default tips by category
const DEFAULT_TIPS = {
  team: [
    'Team names should be clear and recognizable',
    'Consider using department or project names for easier identification',
    'Teams can have multiple categories for different assessment areas',
    'You can change the team name later if needed'
  ],
  category: [
    'Categories help organize questions by topic or domain',
    'Use specific names that clearly describe the assessment area',
    'Well-defined rubrics help ensure consistent scoring',
    'You can add multiple rubric ranges for different complexity levels'
  ],
  question: [
    'Write clear, specific questions that assess one concept at a time',
    'Avoid ambiguous wording that could be interpreted differently',
    'Include a range of point values to differentiate between answers',
    'Group related questions under the same category'
  ],
  default: [
    'Fill in all required fields marked with an asterisk (*)',
    'Review your entries before submitting the form',
    'You can edit or update this information later if needed'
  ]
};

// ===================================================================
// COMPONENTS
// ===================================================================

/**
 * FormTips - Displays helpful tips and guidance for form completion
 */
export const FormTips: React.FC<FormTipsProps> = ({ 
  category, 
  customTips, 
  title = "Helpful Tips" 
}) => {
  // Determine which tips to show - custom tips or default tips for the category
  const tipsToShow = customTips || 
    DEFAULT_TIPS[category as keyof typeof DEFAULT_TIPS] || 
    DEFAULT_TIPS.default;

  return (
    <div style={helperContainer}>
      <div style={helperTitle}>
        <span role="img" aria-hidden="true">💡</span> {title}
      </div>
      <div style={helperContent}>
        <ul style={tipsList}>
          {tipsToShow.map((tip, index) => (
            <li key={index} style={tipItem}>
              <span style={tipIcon}>•</span>
              <span style={tipText}>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

/**
 * FormProgress - Displays a step indicator for multi-step forms
 */
export const FormProgress: React.FC<FormProgressProps> = ({ 
  currentStep, 
  totalSteps, 
  stepLabels = [], 
  title = "Form Progress" 
}) => {
  // Generate default step labels if not provided
  const labels = stepLabels.length === totalSteps 
    ? stepLabels 
    : Array.from({ length: totalSteps }, (_, i) => `Step ${i + 1}`);

  // Calculate progress percentage
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div style={helperContainer}>
      <div style={helperTitle}>
        <span role="img" aria-hidden="true">📋</span> {title}
      </div>
      <div style={{ ...helperContent, marginBottom: '2rem' }}>
        <div style={progressContainer}>
          <div style={progressBar}></div>
          <div style={{ ...progressFill, width: `${progressPercentage}%` }}></div>
          
          {labels.map((label, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            
            return (
              <div key={index} style={{ position: 'relative', flex: 1, display: 'flex', justifyContent: 'center' }}>
                <div 
                  style={isActive ? activeStepCircle : isCompleted ? completedStepCircle : stepCircle}
                >
                  {isCompleted ? '✓' : stepNumber}
                </div>
                <div style={isActive ? activeStepLabel : stepLabel}>
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * RecentItems - Displays a list of recently created items
 */
export const RecentItems: React.FC<RecentItemsProps> = ({ 
  itemType, 
  items, 
  maxItems = 3, 
  title, 
  loading = false,
  error
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  // Format date to relative time (e.g., "2 hours ago")
  const formatRelativeTime = (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  // Default title based on item type if not provided
  const defaultTitle = `Recent ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}s`;

  return (
    <div style={helperContainer}>
      <div style={helperTitle}>
        <span role="img" aria-hidden="true">🕒</span> {title || defaultTitle}
      </div>
      <div style={helperContent}>
        {loading ? (
          <div style={loadingSpinner}>Loading...</div>
        ) : error ? (
          <div style={errorMessage}>{error}</div>
        ) : items.length === 0 ? (
          <div style={previewEmpty}>No recent {itemType}s found.</div>
        ) : (
          <div style={recentItemsList}>
            {items.slice(0, maxItems).map((item) => (
              <div 
                key={item.id}
                style={hoveredItem === item.id ? { ...recentItemCard, ...recentItemCardHover } : recentItemCard}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => item.onClick && item.onClick(item.id)}
              >
                <div style={recentItemName}>{item.name}</div>
                <div style={recentItemMeta}>
                  <span>{item.meta || ''}</span>
                  <span>{formatRelativeTime(item.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * FormPreview - Shows a live preview of the form data
 */
export const FormPreview: React.FC<FormPreviewProps> = ({ 
  title = "Preview", 
  data, 
  template = 'custom',
  customRender 
}) => {
  // Render team preview
  const renderTeamPreview = (data: Record<string, any>) => (
    <>
      <div style={previewContainer}>
        <div style={previewLabel}>Team Name</div>
        <div style={previewValue}>{data.name || <span style={previewEmpty}>Not specified</span>}</div>
      </div>
    </>
  );
  
  // Render category preview
  const renderCategoryPreview = (data: Record<string, any>) => (
    <>
      <div style={previewContainer}>
        <div style={previewLabel}>Category Name</div>
        <div style={previewValue}>{data.name || <span style={previewEmpty}>Not specified</span>}</div>
        
        {data.rubric && data.rubric.length > 0 && (
          <>
            <div style={{ ...previewLabel, marginTop: '0.75rem' }}>Rubric</div>
            {data.rubric.map((range: any, index: number) => (
              <div key={index} style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                {range.min}-{range.max} = {range.storyPoints} point{range.storyPoints !== 1 ? 's' : ''}
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
  
  // Render question preview
  const renderQuestionPreview = (data: Record<string, any>) => (
    <>
      <div style={previewContainer}>
        <div style={previewLabel}>Question</div>
        <div style={previewValue}>{data.text || <span style={previewEmpty}>Not specified</span>}</div>
        
        {data.options && data.options.length > 0 && (
          <>
            <div style={{ ...previewLabel, marginTop: '0.75rem' }}>Options</div>
            {data.options.map((option: any, index: number) => (
              <div key={index} style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                {option.label}: {option.points} point{option.points !== 1 ? 's' : ''}
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
  
  // Choose the appropriate renderer based on template
  const renderPreview = () => {
    if (customRender) return customRender(data);
    
    switch (template) {
      case 'team':
        return renderTeamPreview(data);
      case 'category':
        return renderCategoryPreview(data);
      case 'question':
        return renderQuestionPreview(data);
      default:
        // Default renderer for custom data
        return (
          <div style={previewContainer}>
            {Object.entries(data).map(([key, value]) => (
              <div key={key} style={{ marginBottom: '0.5rem' }}>
                <div style={previewLabel}>{key}</div>
                <div style={previewValue}>
                  {value ? String(value) : <span style={previewEmpty}>Not specified</span>}
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div style={helperContainer}>
      <div style={helperTitle}>
        <span role="img" aria-hidden="true">👁️</span> {title}
      </div>
      <div style={helperContent}>
        {Object.keys(data).length === 0 ? (
          <div style={previewEmpty}>Fill in the form to see a preview</div>
        ) : (
          renderPreview()
        )}
      </div>
    </div>
  );
};

/**
 * QuickActions - Provides shortcut buttons for common actions
 */
export const QuickActions: React.FC<QuickActionsProps> = ({ 
  title = "Quick Actions", 
  actions 
}) => {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  return (
    <div style={helperContainer}>
      <div style={helperTitle}>
        <span role="img" aria-hidden="true">⚡</span> {title}
      </div>
      <div style={helperContent}>
        <div style={quickActionsList}>
          {actions.map((action, index) => (
            <button
              key={index}
              style={
                action.disabled
                  ? { ...quickActionButton, ...quickActionButtonDisabled }
                  : hoveredAction === action.label
                  ? { ...quickActionButton, ...quickActionButtonHover }
                  : quickActionButton
              }
              onClick={action.onClick}
              disabled={action.disabled}
              onMouseEnter={() => setHoveredAction(action.label)}
              onMouseLeave={() => setHoveredAction(null)}
              title={action.label}
            >
              {action.icon && <span style={quickActionIcon}>{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * FormHelpers - Container component that combines all helper components
 */
export const FormHelpers: React.FC<FormHelpersProps> = ({
  formType,
  show = {
    tips: true,
    progress: false,
    recentItems: false,
    preview: false,
    quickActions: false
  },
  formData = {},
  currentStep = 1,
  totalSteps = 3,
  recentItems = [],
  quickActions = [],
  customTips
}) => {
  // Default quick actions if none provided
  const defaultQuickActions = [
    {
      label: 'Clear Form',
      icon: '🗑️',
      onClick: () => console.log('Clear form clicked')
    },
    {
      label: 'Save Draft',
      icon: '💾',
      onClick: () => console.log('Save draft clicked')
    },
    {
      label: 'Copy from Existing',
      icon: '📋',
      onClick: () => console.log('Copy from existing clicked')
    }
  ];

  const actionsToUse = quickActions.length > 0 ? quickActions : defaultQuickActions;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {show.tips && (
        <FormTips category={formType} customTips={customTips} />
      )}
      
      {show.progress && (
        <FormProgress currentStep={currentStep} totalSteps={totalSteps} />
      )}
      
      {show.preview && (
        <FormPreview data={formData} template={formType as any} />
      )}
      
      {show.recentItems && (
        <RecentItems itemType={formType} items={recentItems} />
      )}
      
      {show.quickActions && (
        <QuickActions actions={actionsToUse} />
      )}
    </div>
  );
};

export default FormHelpers;
