import axios from 'axios';

// API service configuration
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost/ICMS_DOST-%20PSTO/ICMS_backend'
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This replaces credentials: 'include' for axios
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Token added to request:', token.substring(0, 50) + '...');
  } else {
    console.warn('No token found in localStorage');
  }
  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if 401
      localStorage.removeItem('token');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Authentication API methods
  async loginUser(credentials) {
    return api.post('/api/auth/login.php', credentials);
  },

  async clientLogin(credentials) {
    return api.post('/api/auth/client_login.php', credentials);
  },

  // User API methods
  async createUser(userData) {
    return api.post('/api/users/create_user.php', userData);
  },

  async deleteUser(userId) {
    return api.delete('/api/users/delete_user.php', {
      data: { id: userId }
    });
  },

  async updateUser(userData) {
    return api.put('/api/users/update_user.php', userData);
  },

  // Request API methods
  async createRequest(requestData) {
    return api.post('/api/request/create_reservation.php', requestData);
  },

  async createRequestWithAttachment({ formData }) {
    return api.post('/api/request/create_with_attachment.php', formData, {
      headers: { 'Content-Type': undefined },
    });
  },

  async createEquipment(equipmentData) {
    return api.post('/api/request/create_equipment.php', equipmentData);
  },

  async getRequests() {
    return api.get('/api/request/read.php');
  },

  async getRequestDetails(refNo) {
    return api.get(`/api/request/read_one.php?ref=${refNo}`);
  },

  async updateRequest(refNo, requestData) {
    return api.post(
      `/api/request/update_reservation.php`,
      { ...requestData, reference_number: refNo },
      { headers: { 'Content-Type': 'application/json' } }
    );
  },

  async updateRequestStatus(statusData) {
    // Use POST for broader server compatibility (some servers restrict PUT)
    return api.post('/api/request/update_status.php', statusData);
  },

  async deleteRequest(requestId) {
    return api.delete('/api/request/delete.php', { data: { id: requestId } });
  },

  async getUsers() {
    return api.get('/api/users/get_users.php');
  },

  // Client API methods
  async createClient(clientData) {
    return api.post('/api/clients/create_client.php', clientData);
  },

  async updateClient(clientData) {
    return api.put('/api/clients/update_client.php', clientData);
  },

  async getClients() {
    return api.get('/api/clients/get_clients.php');
  },

  async getClientDetails(clientId) {
    return api.get(`/api/clients/get_client_details.php?id=${clientId}`);
  },

  async getRequestsByClientId(clientId) {
    return api.get(`/api/request/read.php?client_id=${clientId}`);
  },

  async getInventory() {
    return api.get('/api/inventory/get_items.php');
  },

  async createInventoryItem(itemData) {
    return api.post('/api/inventory/add_item.php', itemData);
  },

  async updateInventoryItem(itemData) {
    return api.put('/api/inventory/update_item.php', itemData);
  },

  async deleteInventoryItem(itemId) {
    return api.delete('/api/inventory/delete_item.php', {
      data: { id: itemId }
    });
  },

  async getReports() {
    return api.get('/reports');
  },

  async saveCalibrationRecord(recordData) {
    console.log('Saving calibration record with data:', recordData);
    console.log('API base URL:', api.defaults.baseURL);
    console.log('Full URL:', api.defaults.baseURL + '/api/calibration/save_record.php');
    
    // Validate required fields
    const requiredFields = ['sample_id', 'calibration_type', 'input_data', 'calibrated_by'];
    const missingFields = requiredFields.filter(field => !recordData[field]);
    
    if (missingFields.length > 0) {
      const error = new Error(`Missing required fields: ${missingFields.join(', ')}`);
      console.error('Validation error:', error.message);
      throw error;
    }
    
    // Ensure date_completed is set if not provided
    if (!recordData.date_completed && recordData.date_started) {
      recordData.date_completed = recordData.date_started;
    }
    
    // Ensure result_data is not null/undefined
    if (!recordData.result_data) {
      recordData.result_data = [];
    }
    
    try {
      const response = await api.post('/api/calibration/save_record.php', recordData);
      console.log('Save response:', response);
      
      if (response.data && response.data.message) {
        console.log('Save message:', response.data.message);
      }
      
      return response;
    } catch (error) {
      console.error('Save error:', error);
      console.error('Error response:', error.response);
      
      // Provide more helpful error messages
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          throw new Error(`Calibration save failed: ${errorData.message}`);
        }
      }
      
      throw error;
    }
  },

  async getEquipmentBySerial(serialNo) {
    return api.get(`/api/equipment/read_one.php?serial_no=${serialNo}`);
  },

  async updateEquipmentStatus(id, status) {
    return api.post('/api/equipment/update_status.php', { id, status });
  },

  async getCalibrationRecordBySampleId(sampleId) {
    return api.get(`/api/calibration/get_record_by_sample.php?sample_id=${sampleId}`);
  },

  async getAllEquipment() {
    return api.get('/api/equipment/read.php');
  },

  async getEquipmentById(id) {
    return api.get(`/api/equipment/read_one.php?id=${id}`);
  },

  // Transaction API methods
  async getTransactions() {
    return api.get('/api/transaction/read.php');
  },

  async updateDiscount(discountData) {
    return api.post('/api/transaction/update_discount.php', discountData);
  },

  async processPayment(paymentData) {
    return api.post('/api/transaction/process_payment.php', paymentData);
  },

  async createTransaction(data) {
    return api.post('/api/transaction/create_transaction.php', data);
  },

  async createSample(sampleData) {
    return api.post('/api/request/create_equipment.php', sampleData);
  },

  async getSampleBySerial(serialNo) {
    return api.get(`/api/sample/read_one.php?serial_no=${serialNo}`);
  },

  async updateSampleStatus(id, status) {
    return api.post('/api/sample/update_status.php', { id, status });
  },


  async getAllSamples() {
    return api.get('/api/sample/read.php');
  },

  async getSampleById(id) {
    return api.get(`/api/sample/read_one.php?id=${id}`);
  },

  // Settings API methods
  async getSettings() {
    return api.get('/api/settings/get_settings.php');
  },

  async updateSettings(settingsType, settingsData) {
    return api.post('/api/settings/update_settings.php', {
      settings_type: settingsType,
      settings_data: settingsData
    });
  },

  async backupSettings() {
    return api.post('/api/settings/backup_settings.php');
  },

  async restoreSettings(backupData) {
    return api.post('/api/settings/restore_settings.php', {
      backup_data: backupData
    });
  },

  // System logs (admin only)
  async getSystemLogs({ limit = 200, offset = 0 } = {}) {
    return api.get(`/api/settings/get_logs.php?limit=${limit}&offset=${offset}`);
  },

  // Full System Backup API methods
  async getBackupInfo() {
    return api.get('/api/backup/backup_info.php');
  },

  async getBackupLogs() {
    return api.get('/api/backup/backup_schedule.php');
  },

  async createFullBackup() {
    return api.post('/api/backup/full_backup.php');
  },

  async restoreFullBackup(backupData) {
    return api.post('/api/backup/full_restore.php', {
      backup_data: backupData
    });
  },

  // SQL Backup/Restore (file-based)
  async exportSqlBackup() {
    return api.get('/api/backup/export_sql.php', { responseType: 'blob' });
  },

  async importSqlBackup(file) {
    const form = new FormData();
    form.append('sql_file', file);
    return api.post('/api/backup/import_sql.php', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Debug endpoints
  async debugBackup() {
    return api.get('/api/backup/debug_backup.php');
  },

  async testBackup() {
    return api.get('/api/backup/test_backup.php');
  },

  // Signatory Management API methods
  async getSignatories() {
    return api.get('/api/settings/signatories.php');
  },

  async createSignatory(signatoryData) {
    return api.post('/api/settings/signatories.php', signatoryData);
  },

  async updateSignatory(id, signatoryData) {
    return api.put('/api/settings/signatories.php', { id, ...signatoryData });
  },

  async deleteSignatory(id) {
    return api.delete('/api/settings/signatories.php', { data: { id } });
  },

  async getSignatory(role = 'technical_manager') {
    return api.get(`/api/settings/get_signatory.php?role=${role}`);
  }
};

export default api;