import { axiosInterceptor } from '../lib/interceptor';

export class PaymentApiService {
  
  private handleError(error: any, defaultMessage: string): Error {
    console.error('PaymentAPI Error:', error);
    return new Error(error.message || defaultMessage);
  }

  async getPaymentDashboardCounts(userId: string): Promise<any> {
    try {
      const response = await axiosInterceptor.get('/Payment/getDashboardCounts', {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch payment dashboard counts');
    }
  }

  async getPaymentsData(params: any): Promise<any> {
    try {
      const response = await axiosInterceptor.get('/Payment/getPayments', {
        params
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch payments data');
    }
  }

  async processPayment(paymentData: any): Promise<any> {
    try {
      const response = await axiosInterceptor.post('/Payment/processPayment', paymentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to process payment');
    }
  }

  async verifyPaymentStatus(paymentId: string): Promise<any> {
    try {
      const response = await axiosInterceptor.post('/Payment/verifyStatus', { paymentId });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to verify payment status');
    }
  }

  async getPaymentHistory(params: any): Promise<any> {
    try {
      const response = await axiosInterceptor.get('/Payment/getHistory', {
        params
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch payment history');
    }
  }

  async cancelPayment(paymentId: string, reason?: string): Promise<any> {
    try {
      const response = await axiosInterceptor.post('/Payment/cancelPayment', {
        paymentId,
        reason
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to cancel payment');
    }
  }

  async getPaymentReceipt(paymentId: string, format?: string): Promise<any> {
    try {
      const response = await axiosInterceptor.get('/Payment/getReceipt', {
        params: { paymentId, format }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch payment receipt');
    }
  }

  async getPaymentDetails(paymentId: string): Promise<any> {
    try {
      const response = await axiosInterceptor.get('/Payment/getPaymentDetails', {
        params: { paymentId }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch payment details');
    }
  }

  async updatePaymentStatus(paymentId: string, status: string, remarks?: string): Promise<any> {
    try {
      const response = await axiosInterceptor.post('/Payment/updateStatus', {
        paymentId,
        status,
        remarks
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to update payment status');
    }
  }

  async initiateRefund(paymentId: string, reason: string): Promise<any> {
    try {
      const response = await axiosInterceptor.post('/Payment/initiateRefund', {
        paymentId,
        reason
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to initiate refund');
    }
  }

  async getFeeStructure(): Promise<any> {
    try {
      const response = await axiosInterceptor.get('/Payment/getFeeStructure');
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch fee structure');
    }
  }

  async initiatePayment(paymentData: any): Promise<any> {
    try {
      const response = await axiosInterceptor.post('/Payment/initiatePayment', paymentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to initiate payment');
    }
  }

  async verifyPayment(paymentId: string, action: string, remarks?: string): Promise<any> {
    try {
      const response = await axiosInterceptor.post('/Payment/verifyPayment', {
        paymentId,
        action,
        remarks
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to verify payment');
    }
  }
}

export const paymentApiService = new PaymentApiService();
