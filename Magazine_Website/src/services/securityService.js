import api from './api';

const API_BASE = '/api/security';

export const securityService = {
  // Security Dashboard
  async getDashboard(timeframe = '24h') {
    try {
      const response = await api.get(`${API_BASE}/dashboard`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch security dashboard:', error);
      throw error;
    }
  },

  // Security Logs
  async getSecurityLogs(params = {}) {
    try {
      const response = await api.get(`${API_BASE}/logs`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch security logs:', error);
      throw error;
    }
  },

  // Security Settings
  async getSecuritySettings() {
    try {
      const response = await api.get(`${API_BASE}/settings`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch security settings:', error);
      throw error;
    }
  },

  async updateSecuritySetting(settingKey, settingValue) {
    try {
      const response = await api.put(`${API_BASE}/settings`, {
        settingKey,
        settingValue
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update security setting:', error);
      throw error;
    }
  },

  // Security Incidents
  async getSecurityIncidents(params = {}) {
    try {
      const response = await api.get(`${API_BASE}/incidents`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch security incidents:', error);
      throw error;
    }
  },

  async createSecurityIncident(incidentData) {
    try {
      const response = await api.post(`${API_BASE}/incidents`, incidentData);
      return response.data;
    } catch (error) {
      console.error('Failed to create security incident:', error);
      throw error;
    }
  },

  async updateSecurityIncident(id, updateData) {
    try {
      const response = await api.put(`${API_BASE}/incidents/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Failed to update security incident:', error);
      throw error;
    }
  },

  // Backup Management
  async getBackupLogs(params = {}) {
    try {
      const response = await api.get(`${API_BASE}/backups`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch backup logs:', error);
      throw error;
    }
  },

  async createBackup(backupData) {
    try {
      const response = await api.post(`${API_BASE}/backup`, backupData);
      return response.data;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw error;
    }
  },

  // Threat Intelligence
  async getThreats(params = {}) {
    try {
      const response = await api.get(`${API_BASE}/threats`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch threats:', error);
      throw error;
    }
  },

  async addThreatIntelligence(threatData) {
    try {
      const response = await api.post(`${API_BASE}/threats`, threatData);
      return response.data;
    } catch (error) {
      console.error('Failed to add threat intelligence:', error);
      throw error;
    }
  },

  // Compliance
  async getComplianceStatus() {
    try {
      const response = await api.get(`${API_BASE}/compliance`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch compliance status:', error);
      throw error;
    }
  },

  // Security Event Logging (for client-side events)
  async logSecurityEvent(eventData) {
    try {
      const response = await api.post(`${API_BASE}/log-event`, eventData);
      return response.data;
    } catch (error) {
      console.error('Failed to log security event:', error);
      // Don't throw error for logging failures to avoid breaking user experience
      return null;
    }
  },

  // Security Health Check
  async getSecurityHealth() {
    try {
      const response = await api.get(`${API_BASE}/health`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch security health:', error);
      throw error;
    }
  },

  // Security Reports
  async generateSecurityReport(reportType, params = {}) {
    try {
      const response = await api.post(`${API_BASE}/reports/${reportType}`, params);
      return response.data;
    } catch (error) {
      console.error('Failed to generate security report:', error);
      throw error;
    }
  },

  // Security Alerts
  async getSecurityAlerts(params = {}) {
    try {
      const response = await api.get(`${API_BASE}/alerts`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch security alerts:', error);
      throw error;
    }
  },

  async acknowledgeAlert(alertId) {
    try {
      const response = await api.put(`${API_BASE}/alerts/${alertId}/acknowledge`);
      return response.data;
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      throw error;
    }
  },

  // Security Policies
  async getSecurityPolicies() {
    try {
      const response = await api.get(`${API_BASE}/policies`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch security policies:', error);
      throw error;
    }
  },

  async updateSecurityPolicy(policyId, policyData) {
    try {
      const response = await api.put(`${API_BASE}/policies/${policyId}`, policyData);
      return response.data;
    } catch (error) {
      console.error('Failed to update security policy:', error);
      throw error;
    }
  },

  // Security Training
  async getSecurityTraining() {
    try {
      const response = await api.get(`${API_BASE}/training`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch security training:', error);
      throw error;
    }
  },

  async completeSecurityTraining(trainingId) {
    try {
      const response = await api.post(`${API_BASE}/training/${trainingId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Failed to complete security training:', error);
      throw error;
    }
  },

  // Security Audit
  async performSecurityAudit(auditType) {
    try {
      const response = await api.post(`${API_BASE}/audit`, { auditType });
      return response.data;
    } catch (error) {
      console.error('Failed to perform security audit:', error);
      throw error;
    }
  },

  async getSecurityAuditResults(auditId) {
    try {
      const response = await api.get(`${API_BASE}/audit/${auditId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch security audit results:', error);
      throw error;
    }
  }
};

export default securityService;