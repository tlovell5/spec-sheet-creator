import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHistory, 
  faPlus, 
  faEdit, 
  faCheck, 
  faTimes, 
  faSignature, 
  faEye, 
  faCalendarAlt,
  faUserClock,
  faClipboardCheck
} from '@fortawesome/free-solid-svg-icons';

function ActivityLog({ specSheetId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch activity logs when component mounts
  useEffect(() => {
    const fetchActivityLogs = async () => {
      if (!specSheetId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('spec_sheet_id', specSheetId)
        .order('timestamp', { ascending: false });
      
      if (error) {
        console.error('Error fetching activity logs:', error);
      } else {
        setActivities(data || []);
      }
      
      setLoading(false);
    };
    
    fetchActivityLogs();
    
    // Set up real-time subscription for new activities
    const subscription = supabase
      .channel(`activity_logs_${specSheetId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'activity_logs',
        filter: `spec_sheet_id=eq.${specSheetId}`
      }, payload => {
        setActivities(prev => [payload.new, ...prev]);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [specSheetId]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format action for display
  const formatAction = (action) => {
    switch (action) {
      case 'CREATED':
        return 'Created';
      case 'UPDATED':
        return 'Updated';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      case 'SIGNED':
        return 'Signed';
      case 'REQUESTED_REVIEW':
        return 'Requested Review';
      default:
        return action;
    }
  };

  // Get action color class
  const getActionClass = (action) => {
    switch (action) {
      case 'CREATED':
        return 'activity-created';
      case 'UPDATED':
        return 'activity-updated';
      case 'APPROVED':
        return 'activity-approved';
      case 'REJECTED':
        return 'activity-rejected';
      case 'SIGNED':
        return 'activity-signed';
      case 'REQUESTED_REVIEW':
        return 'activity-review';
      default:
        return '';
    }
  };

  // Get icon for action
  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATED':
        return faPlus;
      case 'UPDATED':
        return faEdit;
      case 'APPROVED':
        return faCheck;
      case 'REJECTED':
        return faTimes;
      case 'SIGNED':
        return faSignature;
      case 'REQUESTED_REVIEW':
        return faEye;
      default:
        return faHistory;
    }
  };

  return (
    <div className="activity-log-container">
      <h4>
        <FontAwesomeIcon icon={faHistory} /> Activity History
      </h4>
      
      {loading ? (
        <div className="activity-loading">
          <div className="uploading-spinner"></div>
          <p>Loading activity logs...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="activity-empty">
          <FontAwesomeIcon icon={faClipboardCheck} className="activity-empty-icon" />
          <div className="activity-empty-text">No activity logs found for this spec sheet.</div>
        </div>
      ) : (
        <div className="activity-log">
          {activities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-timestamp">
                <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '5px', opacity: 0.7 }} />
                {formatDate(activity.timestamp)}
              </div>
              <div>
                <span className="activity-user">
                  <FontAwesomeIcon icon={faUserClock} style={{ marginRight: '5px' }} />
                  {activity.user_id || 'System'}
                </span>
                <span className={`activity-action ${getActionClass(activity.action)}`}>
                  <FontAwesomeIcon icon={getActionIcon(activity.action)} style={{ marginRight: '5px' }} />
                  {formatAction(activity.action)}
                </span>
                {activity.notes && (
                  <span className="activity-notes"> - {activity.notes}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActivityLog;
